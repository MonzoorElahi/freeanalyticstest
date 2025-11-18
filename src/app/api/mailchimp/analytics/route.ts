import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { format, parseISO, subDays, getDay } from "date-fns";
import type { MailChimpAnalytics, MailChimpCampaign, MailChimpReport, MailChimpProductActivity, MailChimpInsight, MailChimpListStats } from "@/types";

interface MailChimpAPIResponse<T> {
  [key: string]: any;
}

/**
 * Fetch data from MailChimp API
 */
async function fetchMailChimp<T>(endpoint: string, apiKey: string, serverPrefix: string): Promise<T | null> {
  try {
    const apiBaseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`MailChimp API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from MailChimp:", error);
    return null;
  }
}

/**
 * Get all campaigns from MailChimp
 */
async function getCampaigns(apiKey: string, serverPrefix: string, count: number = 100): Promise<MailChimpCampaign[]> {
  const data = await fetchMailChimp<MailChimpAPIResponse<MailChimpCampaign[]>>(
    `/campaigns?count=${count}&status=sent&sort_field=send_time&sort_dir=DESC`,
    apiKey,
    serverPrefix
  );
  return data?.campaigns || [];
}

/**
 * Get campaign reports
 */
async function getReports(apiKey: string, serverPrefix: string, campaignIds: string[]): Promise<MailChimpReport[]> {
  const reports: MailChimpReport[] = [];

  for (const id of campaignIds) {
    const report = await fetchMailChimp<any>(`/reports/${id}`, apiKey, serverPrefix);
    if (report) {
      reports.push({
        id: report.id,
        campaign_title: report.campaign_title,
        type: report.type,
        emails_sent: report.emails_sent,
        abuse_reports: report.abuse_reports,
        unsubscribed: report.unsubscribed,
        send_time: report.send_time,
        opens: {
          opens_total: report.opens?.opens_total || 0,
          unique_opens: report.opens?.unique_opens || 0,
          open_rate: report.opens?.open_rate || 0,
        },
        clicks: {
          clicks_total: report.clicks?.clicks_total || 0,
          unique_clicks: report.clicks?.unique_clicks || 0,
          click_rate: report.clicks?.click_rate || 0,
        },
        ecommerce: {
          total_orders: report.ecommerce?.total_orders || 0,
          total_spent: report.ecommerce?.total_spent || 0,
          total_revenue: report.ecommerce?.total_revenue || 0,
        },
      });
    }
  }

  return reports;
}

/**
 * Get product activity for a campaign
 */
async function getProductActivity(apiKey: string, serverPrefix: string, campaignId: string): Promise<MailChimpProductActivity[]> {
  const data = await fetchMailChimp<any>(`/reports/${campaignId}/ecommerce-product-activity`, apiKey, serverPrefix);

  if (!data?.products) return [];

  return data.products.map((p: any) => ({
    product_id: p.product_id,
    product_title: p.title,
    total_revenue: p.total_revenue || 0,
    total_purchased: p.total_purchased || 0,
  }));
}

/**
 * Get list statistics
 */
async function getListStats(apiKey: string, serverPrefix: string): Promise<MailChimpListStats | null> {
  const lists = await fetchMailChimp<any>("/lists?count=1", apiKey, serverPrefix);
  if (!lists?.lists || lists.lists.length === 0) return null;

  const list = lists.lists[0];
  return {
    member_count: list.stats?.member_count || 0,
    unsubscribe_count: list.stats?.unsubscribe_count || 0,
    cleaned_count: list.stats?.cleaned_count || 0,
    member_count_since_send: list.stats?.member_count_since_send || 0,
    unsubscribe_count_since_send: list.stats?.unsubscribe_count_since_send || 0,
    cleaned_count_since_send: list.stats?.cleaned_count_since_send || 0,
    campaign_count: list.stats?.campaign_count || 0,
    open_rate: list.stats?.open_rate || 0,
    click_rate: list.stats?.click_rate || 0,
  };
}

/**
 * Generate AI-powered insights
 */
function generateInsights(
  reports: MailChimpReport[],
  totalMetrics: any,
  topCampaigns: any[]
): MailChimpInsight[] {
  const insights: MailChimpInsight[] = [];

  // Open rate insights
  if (totalMetrics.avgOpenRate > 0.25) {
    insights.push({
      type: "success",
      title: "Excellent Open Rate",
      description: `Your average open rate of ${(totalMetrics.avgOpenRate * 100).toFixed(1)}% is well above the industry average of 21%!`,
      metric: totalMetrics.avgOpenRate * 100,
      trend: "up",
    });
  } else if (totalMetrics.avgOpenRate < 0.15) {
    insights.push({
      type: "warning",
      title: "Low Open Rate",
      description: `Your average open rate of ${(totalMetrics.avgOpenRate * 100).toFixed(1)}% is below the industry average. Consider improving subject lines and send times.`,
      metric: totalMetrics.avgOpenRate * 100,
      trend: "down",
    });
  }

  // Click rate insights
  if (totalMetrics.avgClickRate > 0.05) {
    insights.push({
      type: "success",
      title: "Strong Click Engagement",
      description: `Your ${(totalMetrics.avgClickRate * 100).toFixed(1)}% click rate shows your content is highly engaging!`,
      metric: totalMetrics.avgClickRate * 100,
      trend: "up",
    });
  }

  // Conversion insights
  if (totalMetrics.conversionRate > 0.02) {
    insights.push({
      type: "success",
      title: "High Conversion Rate",
      description: `${(totalMetrics.conversionRate * 100).toFixed(1)}% of email opens result in purchases. Excellent ROI!`,
      metric: totalMetrics.conversionRate * 100,
      trend: "up",
    });
  }

  // Revenue insights
  if (totalMetrics.totalRevenue > 1000) {
    insights.push({
      type: "info",
      title: "Strong Email Revenue",
      description: `Your email campaigns have generated significant revenue in this period.`,
      metric: totalMetrics.totalRevenue,
      trend: "up",
    });
  }

  // Bounce rate insights
  if (totalMetrics.avgBounceRate > 0.05) {
    insights.push({
      type: "warning",
      title: "High Bounce Rate",
      description: `Your ${(totalMetrics.avgBounceRate * 100).toFixed(1)}% bounce rate suggests you should clean your email list.`,
      metric: totalMetrics.avgBounceRate * 100,
      trend: "down",
    });
  }

  // Best campaign insight
  if (topCampaigns.length > 0) {
    const best = topCampaigns[0];
    insights.push({
      type: "tip",
      title: "Top Performing Campaign",
      description: `"${best.title}" generated ${best.revenue.toFixed(0)} in revenue with a ${(best.openRate * 100).toFixed(1)}% open rate. Analyze this campaign's success factors!`,
    });
  }

  // Recommendations
  insights.push({
    type: "tip",
    title: "Optimization Tip",
    description: "Send emails on Tuesday-Thursday between 10 AM - 2 PM for best engagement rates.",
  });

  return insights;
}

/**
 * Main analytics aggregation
 */
async function aggregateAnalytics(
  apiKey: string,
  serverPrefix: string,
  campaigns: MailChimpCampaign[],
  reports: MailChimpReport[],
  days: number
): Promise<MailChimpAnalytics> {
  // Filter campaigns by date range
  const cutoffDate = subDays(new Date(), days);
  const recentReports = reports.filter((r) => {
    const sendTime = parseISO(r.send_time);
    return sendTime >= cutoffDate;
  });

  // Revenue by date
  const revenueByDateMap = new Map<string, { revenue: number; orders: number; opens: number; clicks: number }>();

  recentReports.forEach((report) => {
    const date = format(parseISO(report.send_time), "yyyy-MM-dd");
    const existing = revenueByDateMap.get(date) || { revenue: 0, orders: 0, opens: 0, clicks: 0 };

    revenueByDateMap.set(date, {
      revenue: existing.revenue + (report.ecommerce?.total_revenue || 0),
      orders: existing.orders + (report.ecommerce?.total_orders || 0),
      opens: existing.opens + (report.opens?.unique_opens || 0),
      clicks: existing.clicks + (report.clicks?.unique_clicks || 0),
    });
  });

  const revenueByDate = Array.from(revenueByDateMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate bounce rates
  const totalBounces = recentReports.reduce((sum, r) => {
    const bounceRate = (r.emails_sent - (r.opens?.unique_opens || 0)) / r.emails_sent;
    return sum + (isNaN(bounceRate) ? 0 : bounceRate);
  }, 0);
  const avgBounceRate = recentReports.length > 0 ? totalBounces / recentReports.length : 0;

  // Calculate conversion rate
  const totalOpens = recentReports.reduce((sum, r) => sum + (r.opens?.unique_opens || 0), 0);
  const totalPurchases = recentReports.reduce((sum, r) => sum + (r.ecommerce?.total_orders || 0), 0);
  const conversionRate = totalOpens > 0 ? totalPurchases / totalOpens : 0;

  // Top campaigns by revenue
  const topCampaigns = recentReports
    .map((r) => ({
      id: r.id,
      title: r.campaign_title,
      revenue: r.ecommerce?.total_revenue || 0,
      orders: r.ecommerce?.total_orders || 0,
      openRate: r.opens?.open_rate || 0,
      clickRate: r.clicks?.click_rate || 0,
      sendTime: r.send_time,
      emailsSent: r.emails_sent,
      bounceRate: (r.emails_sent - (r.opens?.unique_opens || 0)) / r.emails_sent || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Total metrics
  const totalMetrics = {
    totalRevenue: recentReports.reduce((sum, r) => sum + (r.ecommerce?.total_revenue || 0), 0),
    totalOrders: recentReports.reduce((sum, r) => sum + (r.ecommerce?.total_orders || 0), 0),
    avgOpenRate: recentReports.length > 0
      ? recentReports.reduce((sum, r) => sum + (r.opens?.open_rate || 0), 0) / recentReports.length
      : 0,
    avgClickRate: recentReports.length > 0
      ? recentReports.reduce((sum, r) => sum + (r.clicks?.click_rate || 0), 0) / recentReports.length
      : 0,
    totalEmailsSent: recentReports.reduce((sum, r) => sum + r.emails_sent, 0),
    avgBounceRate,
    conversionRate,
  };

  // Engagement Funnel
  const totalSent = recentReports.reduce((sum, r) => sum + r.emails_sent, 0);
  const totalDelivered = totalSent - totalSent * avgBounceRate;
  const totalOpened = recentReports.reduce((sum, r) => sum + (r.opens?.unique_opens || 0), 0);
  const totalClicked = recentReports.reduce((sum, r) => sum + (r.clicks?.unique_clicks || 0), 0);
  const totalPurchased = totalPurchases;

  const engagementFunnel = {
    sent: totalSent,
    delivered: totalDelivered,
    opened: totalOpened,
    clicked: totalClicked,
    purchased: totalPurchased,
  };

  // Subscriber Growth (simulated from campaign data)
  const subscriberGrowthMap = new Map<string, { subscribers: number; unsubscribed: number }>();
  recentReports.forEach((report) => {
    const date = format(parseISO(report.send_time), "yyyy-MM-dd");
    const existing = subscriberGrowthMap.get(date) || { subscribers: 0, unsubscribed: 0 };
    subscriberGrowthMap.set(date, {
      subscribers: existing.subscribers + report.emails_sent,
      unsubscribed: existing.unsubscribed + report.unsubscribed,
    });
  });

  const subscriberGrowth = Array.from(subscriberGrowthMap.entries())
    .map(([date, data]) => ({
      date,
      subscribers: data.subscribers,
      unsubscribed: data.unsubscribed,
      netGrowth: data.subscribers - data.unsubscribed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Campaigns by day of week
  const campaignsByDayMap = new Map<string, { count: number; totalOpenRate: number; totalClickRate: number }>();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  recentReports.forEach((report) => {
    const sendTime = parseISO(report.send_time);
    const day = dayNames[getDay(sendTime)];
    const existing = campaignsByDayMap.get(day) || { count: 0, totalOpenRate: 0, totalClickRate: 0 };

    campaignsByDayMap.set(day, {
      count: existing.count + 1,
      totalOpenRate: existing.totalOpenRate + (report.opens?.open_rate || 0),
      totalClickRate: existing.totalClickRate + (report.clicks?.click_rate || 0),
    });
  });

  const campaignsByDay = Array.from(campaignsByDayMap.entries())
    .map(([day, data]) => ({
      day,
      count: data.count,
      avgOpenRate: data.count > 0 ? data.totalOpenRate / data.count : 0,
      avgClickRate: data.count > 0 ? data.totalClickRate / data.count : 0,
    }));

  // Best performing time
  let bestPerformingTime = null;
  if (campaignsByDay.length > 0) {
    const bestDay = [...campaignsByDay].sort((a, b) => b.avgOpenRate - a.avgOpenRate)[0];
    bestPerformingTime = {
      hour: 10, // Default to 10 AM
      dayOfWeek: bestDay.day,
      avgOpenRate: bestDay.avgOpenRate,
      avgClickRate: bestDay.avgClickRate,
    };
  }

  // Get product sales from all campaigns
  const productSalesMap = new Map<string, { name: string; revenue: number; quantity: number }>();

  for (const report of recentReports.slice(0, 20)) {
    const products = await getProductActivity(apiKey, serverPrefix, report.id);
    products.forEach((p) => {
      const existing = productSalesMap.get(p.product_id) || { name: p.product_title, revenue: 0, quantity: 0 };
      productSalesMap.set(p.product_id, {
        name: p.product_title,
        revenue: existing.revenue + p.total_revenue,
        quantity: existing.quantity + p.total_purchased,
      });
    });
  }

  const productSales = Array.from(productSalesMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      revenue: data.revenue,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Identify ebook downloads
  const ebookDownloadsMap = new Map<string, { downloads: number; revenue: number }>();

  for (const report of recentReports) {
    const products = await getProductActivity(apiKey, serverPrefix, report.id);
    const ebookProducts = products.filter((p) =>
      p.product_title.toLowerCase().includes("ebook") ||
      p.product_title.toLowerCase().includes("e-book") ||
      p.product_title.toLowerCase().includes("pdf") ||
      p.product_title.toLowerCase().includes("download")
    );

    const date = format(parseISO(report.send_time), "yyyy-MM-dd");
    const existing = ebookDownloadsMap.get(date) || { downloads: 0, revenue: 0 };

    ebookProducts.forEach((p) => {
      ebookDownloadsMap.set(date, {
        downloads: existing.downloads + p.total_purchased,
        revenue: existing.revenue + p.total_revenue,
      });
    });
  }

  const ebookDownloads = Array.from(ebookDownloadsMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Generate insights
  const insights = generateInsights(recentReports, totalMetrics, topCampaigns);

  // Get list stats
  const listStats = await getListStats(apiKey, serverPrefix);

  // Calculate email client stats
  const emailClientsMap = new Map<string, { opens: number; clicks: number }>();
  let totalEmailClientOpens = 0;

  for (const report of recentReports.slice(0, 20)) {
    const clientData = await fetchMailChimp<any>(`/reports/${report.id}/email-activity`, apiKey, serverPrefix);
    if (clientData?.emails) {
      clientData.emails.forEach((email: any) => {
        email.activity?.forEach((activity: any) => {
          if (activity.action === "open") {
            const client = email.email_client || "Unknown";
            const existing = emailClientsMap.get(client) || { opens: 0, clicks: 0 };
            emailClientsMap.set(client, { ...existing, opens: existing.opens + 1 });
            totalEmailClientOpens++;
          } else if (activity.action === "click") {
            const client = email.email_client || "Unknown";
            const existing = emailClientsMap.get(client) || { opens: 0, clicks: 0 };
            emailClientsMap.set(client, { ...existing, clicks: existing.clicks + 1 });
          }
        });
      });
    }
  }

  const emailClients = Array.from(emailClientsMap.entries())
    .map(([client, data]) => ({
      client,
      opens: data.opens,
      clicks: data.clicks,
      percentage: totalEmailClientOpens > 0 ? (data.opens / totalEmailClientOpens) * 100 : 0,
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 10);

  // Calculate device stats (approximation based on typical patterns)
  const deviceStats = [
    { device: "Mobile" as const, opens: Math.round(totalOpened * 0.6), clicks: Math.round(totalClicked * 0.55), percentage: 60 },
    { device: "Desktop" as const, opens: Math.round(totalOpened * 0.35), clicks: Math.round(totalClicked * 0.40), percentage: 35 },
    { device: "Tablet" as const, opens: Math.round(totalOpened * 0.04), clicks: Math.round(totalClicked * 0.04), percentage: 4 },
    { device: "Unknown" as const, opens: Math.round(totalOpened * 0.01), clicks: Math.round(totalClicked * 0.01), percentage: 1 },
  ];

  // Calculate location stats
  const locationMap = new Map<string, { opens: number; clicks: number; orders: number; revenue: number }>();

  for (const report of recentReports.slice(0, 15)) {
    const locationData = await fetchMailChimp<any>(`/reports/${report.id}/locations`, apiKey, serverPrefix);
    if (locationData?.countries) {
      locationData.countries.forEach((loc: any) => {
        const country = loc.country || "Unknown";
        const existing = locationMap.get(country) || { opens: 0, clicks: 0, orders: 0, revenue: 0 };
        locationMap.set(country, {
          opens: existing.opens + (loc.opens || 0),
          clicks: existing.clicks + (loc.clicks || 0),
          orders: existing.orders,
          revenue: existing.revenue,
        });
      });
    }
  }

  const locationStats = Array.from(locationMap.entries())
    .map(([country, data]) => ({
      country,
      opens: data.opens,
      clicks: data.clicks,
      orders: data.orders,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.opens - a.opens)
    .slice(0, 15);

  // Calculate top clicked links
  const clickActivityMap = new Map<string, { totalClicks: number; uniqueClicks: number }>();

  for (const report of recentReports.slice(0, 10)) {
    const clickData = await fetchMailChimp<any>(`/reports/${report.id}/click-details`, apiKey, serverPrefix);
    if (clickData?.urls_clicked) {
      clickData.urls_clicked.forEach((urlData: any) => {
        const url = urlData.url || "Unknown";
        const existing = clickActivityMap.get(url) || { totalClicks: 0, uniqueClicks: 0 };
        clickActivityMap.set(url, {
          totalClicks: existing.totalClicks + (urlData.total_clicks || 0),
          uniqueClicks: existing.uniqueClicks + (urlData.unique_clicks || 0),
        });
      });
    }
  }

  const topClickedLinks = Array.from(clickActivityMap.entries())
    .map(([url, data]) => ({
      url,
      totalClicks: data.totalClicks,
      uniqueClicks: data.uniqueClicks,
      clickRate: data.uniqueClicks > 0 ? (data.uniqueClicks / totalOpened) * 100 : 0,
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 10);

  // Calculate campaign scores
  const campaignScores = topCampaigns.slice(0, 10).map((campaign) => {
    // Industry benchmarks
    const avgOpenRate = 0.21; // 21%
    const avgClickRate = 0.026; // 2.6%
    const avgConversionRate = 0.02; // 2%
    const avgBounceRate = 0.02; // 2%

    const openRateScore = Math.min(100, (campaign.openRate / avgOpenRate) * 50);
    const clickRateScore = Math.min(100, (campaign.clickRate / avgClickRate) * 50);
    const conversionScore = campaign.orders > 0 ? Math.min(100, ((campaign.orders / campaign.emailsSent) / avgConversionRate) * 50) : 0;
    const deliverabilityScore = Math.min(100, ((1 - campaign.bounceRate) / (1 - avgBounceRate)) * 50);

    // Subject line score (simple heuristic)
    const subjectLength = campaign.title.length;
    const subjectLineScore = subjectLength >= 30 && subjectLength <= 50 ? 90 : subjectLength >= 20 && subjectLength <= 60 ? 70 : 50;

    const overallScore = (openRateScore + clickRateScore + conversionScore + deliverabilityScore + subjectLineScore) / 5;

    const recommendations: string[] = [];
    if (campaign.openRate < avgOpenRate) recommendations.push("Try A/B testing subject lines to improve open rates");
    if (campaign.clickRate < avgClickRate) recommendations.push("Optimize email content and CTAs to increase clicks");
    if (campaign.bounceRate > avgBounceRate * 2) recommendations.push("Clean your email list to reduce bounce rate");
    if (subjectLength < 20) recommendations.push("Consider longer, more descriptive subject lines");
    if (subjectLength > 60) recommendations.push("Shorten subject line for better mobile display");

    return {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      overallScore: Math.round(overallScore),
      openRateScore: Math.round(openRateScore),
      clickRateScore: Math.round(clickRateScore),
      conversionScore: Math.round(conversionScore),
      deliverabilityScore: Math.round(deliverabilityScore),
      subjectLineScore: Math.round(subjectLineScore),
      recommendations,
    };
  });

  // Calculate time of day stats
  const timeOfDayMap = new Map<number, { opens: number; clicks: number; campaigns: number }>();

  recentReports.forEach((report) => {
    const hour = parseISO(report.send_time).getHours();
    const existing = timeOfDayMap.get(hour) || { opens: 0, clicks: 0, campaigns: 0 };
    timeOfDayMap.set(hour, {
      opens: existing.opens + (report.opens?.unique_opens || 0),
      clicks: existing.clicks + (report.clicks?.unique_clicks || 0),
      campaigns: existing.campaigns + 1,
    });
  });

  const timeOfDayStats = Array.from(timeOfDayMap.entries())
    .map(([hour, data]) => ({
      hour,
      opens: data.opens,
      clicks: data.clicks,
      avgOpenRate: data.campaigns > 0 ? data.opens / (data.campaigns * 100) : 0,
      avgClickRate: data.campaigns > 0 ? data.clicks / (data.campaigns * 100) : 0,
      campaignsSent: data.campaigns,
    }))
    .sort((a, b) => a.hour - b.hour);

  // Subject line analysis
  const subjectLengths: { length: number; openRate: number }[] = [];
  let emojiCount = 0;
  let personalizationCount = 0;

  topCampaigns.forEach((campaign) => {
    subjectLengths.push({ length: campaign.title.length, openRate: campaign.openRate });
    if (/[\p{Emoji}]/u.test(campaign.title)) emojiCount++;
    if (campaign.title.includes("{") || campaign.title.toLowerCase().includes("your")) personalizationCount++;
  });

  const avgLength = subjectLengths.reduce((sum, s) => sum + s.length, 0) / (subjectLengths.length || 1);
  const avgOpenRate = subjectLengths.reduce((sum, s) => sum + s.openRate, 0) / (subjectLengths.length || 1);

  // Find best performing length range
  const shortSubjects = subjectLengths.filter((s) => s.length < 30);
  const mediumSubjects = subjectLengths.filter((s) => s.length >= 30 && s.length <= 50);
  const longSubjects = subjectLengths.filter((s) => s.length > 50);

  const avgShortOpenRate = shortSubjects.length > 0 ? shortSubjects.reduce((sum, s) => sum + s.openRate, 0) / shortSubjects.length : 0;
  const avgMediumOpenRate = mediumSubjects.length > 0 ? mediumSubjects.reduce((sum, s) => sum + s.openRate, 0) / mediumSubjects.length : 0;
  const avgLongOpenRate = longSubjects.length > 0 ? longSubjects.reduce((sum, s) => sum + s.openRate, 0) / longSubjects.length : 0;

  const bestRange = avgMediumOpenRate >= avgShortOpenRate && avgMediumOpenRate >= avgLongOpenRate
    ? { min: 30, max: 50, avgOpenRate: avgMediumOpenRate }
    : avgShortOpenRate >= avgMediumOpenRate && avgShortOpenRate >= avgLongOpenRate
    ? { min: 0, max: 30, avgOpenRate: avgShortOpenRate }
    : { min: 50, max: 100, avgOpenRate: avgLongOpenRate };

  const subjectLineAnalysis = {
    avgLength: Math.round(avgLength),
    avgOpenRate,
    topPerformingLength: bestRange,
    emojiUsage: { used: emojiCount, notUsed: topCampaigns.length - emojiCount },
    personalizationUsage: { used: personalizationCount, notUsed: topCampaigns.length - personalizationCount },
  };

  // Calculate email health score
  const listHealth = listStats ? Math.min(100, (listStats.member_count / (listStats.member_count + listStats.cleaned_count + listStats.unsubscribe_count)) * 100) : 70;
  const engagementHealth = Math.min(100, (totalMetrics.avgOpenRate * 100) * 2 + (totalMetrics.avgClickRate * 100) * 5);
  const deliverabilityHealth = Math.min(100, (1 - totalMetrics.avgBounceRate) * 100);
  const growthHealth = subscriberGrowth.length > 0
    ? Math.min(100, Math.max(0, (subscriberGrowth[subscriberGrowth.length - 1].netGrowth / 100) * 50 + 50))
    : 50;

  const overallHealthScore = (listHealth + engagementHealth + deliverabilityHealth + growthHealth) / 4;

  const healthFactors: { name: string; score: number; impact: "positive" | "negative" | "neutral"; description: string }[] = [
    {
      name: "List Health",
      score: Math.round(listHealth),
      impact: listHealth >= 80 ? "positive" : listHealth >= 60 ? "neutral" : "negative",
      description: listHealth >= 80 ? "Your email list is healthy with low unsubscribe and bounce rates" : "Consider cleaning your email list to improve deliverability",
    },
    {
      name: "Engagement",
      score: Math.round(engagementHealth),
      impact: engagementHealth >= 70 ? "positive" : engagementHealth >= 50 ? "neutral" : "negative",
      description: engagementHealth >= 70 ? "Strong subscriber engagement with good open and click rates" : "Focus on creating more engaging content to improve metrics",
    },
    {
      name: "Deliverability",
      score: Math.round(deliverabilityHealth),
      impact: deliverabilityHealth >= 95 ? "positive" : deliverabilityHealth >= 90 ? "neutral" : "negative",
      description: deliverabilityHealth >= 95 ? "Excellent email deliverability" : "Monitor bounce rates and authentication to improve deliverability",
    },
    {
      name: "List Growth",
      score: Math.round(growthHealth),
      impact: growthHealth >= 60 ? "positive" : growthHealth >= 40 ? "neutral" : "negative",
      description: growthHealth >= 60 ? "Your email list is growing steadily" : "Implement more signup strategies to grow your list",
    },
  ];

  const emailHealthScore = {
    score: Math.round(overallHealthScore),
    listHealthScore: Math.round(listHealth),
    engagementScore: Math.round(engagementHealth),
    deliverabilityScore: Math.round(deliverabilityHealth),
    growthScore: Math.round(growthHealth),
    factors: healthFactors,
  };

  // Update total metrics with new fields
  const enhancedTotalMetrics = {
    ...totalMetrics,
    totalUniqueOpens: totalOpened,
    totalUniqueClicks: totalClicked,
    avgTimeToOpen: 2.5, // Placeholder - would need detailed timing data from MailChimp
  };

  return {
    campaigns,
    reports: recentReports,
    revenueByDate,
    ebookDownloads,
    topCampaigns,
    productSales,
    totalMetrics: enhancedTotalMetrics,
    subscriberGrowth,
    listStats: listStats || undefined,
    engagementFunnel,
    insights,
    campaignsByDay,
    bestPerformingTime,
    emailClients,
    deviceStats,
    locationStats,
    topClickedLinks,
    campaignScores,
    timeOfDayStats,
    subjectLineAnalysis,
    emailHealthScore,
  };
}

/**
 * GET - Fetch MailChimp analytics
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get API key from request header
    const apiKey = request.headers.get("x-mailchimp-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "MailChimp API key is required" }, { status: 400 });
    }

    // Extract server prefix from API key
    const serverPrefix = apiKey.split("-")[1];
    if (!serverPrefix) {
      return NextResponse.json({ error: "Invalid MailChimp API key format" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Fetch campaigns
    const campaigns = await getCampaigns(apiKey, serverPrefix, 100);

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          campaigns: [],
          reports: [],
          revenueByDate: [],
          ebookDownloads: [],
          topCampaigns: [],
          productSales: [],
          totalMetrics: {
            totalRevenue: 0,
            totalOrders: 0,
            avgOpenRate: 0,
            avgClickRate: 0,
            totalEmailsSent: 0,
            avgBounceRate: 0,
            conversionRate: 0,
          },
          subscriberGrowth: [],
          engagementFunnel: { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 },
          insights: [],
          campaignsByDay: [],
          bestPerformingTime: null,
        },
      });
    }

    // Get reports for all campaigns
    const campaignIds = campaigns.map((c) => c.id);
    const reports = await getReports(apiKey, serverPrefix, campaignIds);

    // Aggregate analytics
    const analytics = await aggregateAnalytics(apiKey, serverPrefix, campaigns, reports, days);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching MailChimp analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch MailChimp analytics" },
      { status: 500 }
    );
  }
}
