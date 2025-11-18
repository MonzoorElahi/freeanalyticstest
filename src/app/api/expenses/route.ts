import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { Expense } from "@/types";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const EXPENSES_FILE = path.join(process.cwd(), "data", "expenses.json");

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readExpenses(): Promise<Expense[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(EXPENSES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function writeExpenses(expenses: Expense[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
}

// GET - Fetch all expenses or filter by date range
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let expenses = await readExpenses();

    // Filter by date range if provided
    if (startDate && endDate) {
      expenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      });
    }

    return NextResponse.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST - Create new expense
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, amount, category, description, source } = body;

    // Validation
    if (!date || !amount || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields: date, amount, category, description" },
        { status: 400 }
      );
    }

    // Parse and validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a valid number greater than 0" }, { status: 400 });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Validate category
    const validCategories = ["Marketing", "Advertising", "Shipping", "Software", "Operations", "Salaries", "Rent", "Utilities", "Other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid expense category" }, { status: 400 });
    }

    const expenses = await readExpenses();

    const newExpense: Expense = {
      id: randomUUID(),
      date,
      amount: parsedAmount,
      category,
      description: description.trim(),
      source: source ? source.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);
    await writeExpenses(expenses);

    return NextResponse.json({
      success: true,
      data: newExpense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

// PUT - Update existing expense
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, date, amount, category, description, source } = body;

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const expenses = await readExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Validate and parse updated values
    let parsedAmount = expenses[index].amount;
    if (amount !== undefined) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: "Amount must be a valid number greater than 0" }, { status: 400 });
      }
    }

    // Validate date if provided
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
    }

    // Validate category if provided
    if (category) {
      const validCategories = ["Marketing", "Advertising", "Shipping", "Software", "Operations", "Salaries", "Rent", "Utilities", "Other"];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid expense category" }, { status: 400 });
      }
    }

    // Update expense
    expenses[index] = {
      ...expenses[index],
      date: date || expenses[index].date,
      amount: parsedAmount,
      category: category || expenses[index].category,
      description: description ? description.trim() : expenses[index].description,
      source: source !== undefined ? (source ? source.trim() : undefined) : expenses[index].source,
    };

    await writeExpenses(expenses);

    return NextResponse.json({
      success: true,
      data: expenses[index],
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

// DELETE - Remove expense
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const expenses = await readExpenses();
    const filteredExpenses = expenses.filter((e) => e.id !== id);

    if (filteredExpenses.length === expenses.length) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await writeExpenses(filteredExpenses);

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
