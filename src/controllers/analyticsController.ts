import { Request, Response } from "express";
import { db } from "../config/db.js";
import { RowDataPacket } from "mysql2";

// Helper to build date filter clause
const getDateFilter = (startDate?: string, endDate?: string) => {
  let dateClause = "";
  const params: any[] = [];

  if (startDate && endDate) {
    dateClause = " WHERE survey_created_at BETWEEN ? AND ?";
    params.push(startDate, endDate);
  } else if (startDate) {
    dateClause = " WHERE survey_created_at >= ?";
    params.push(startDate);
  }

  return { dateClause, params };
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 1. KPI Cards: Total Certificates, Unique Students, Countries, Courses
    const kpiQuery = `
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(DISTINCT email_address) as unique_students,
        COUNT(DISTINCT certificate_country) as active_countries,
        COUNT(DISTINCT course_name) as distinct_courses
      FROM course_certifications ${dateClause}
    `;

    const [rows] = await db.query<RowDataPacket[]>(kpiQuery, params);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCertificateTrends = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 2. Line Chart: Certificates issued over time (Grouped by Day)
    const sql = `
      SELECT DATE(survey_created_at) as date, COUNT(*) as count 
      FROM course_certifications 
      ${dateClause} 
      GROUP BY DATE(survey_created_at) 
      ORDER BY date ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trends" });
  }
};

export const getTopStudents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 3. Bar Chart: Top 10 Students with most certificates
    const sql = `
      SELECT certificate_name as name, email_address, COUNT(*) as count 
      FROM course_certifications 
      ${dateClause} 
      GROUP BY email_address, certificate_name 
      ORDER BY count DESC 
      LIMIT 10
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top students" });
  }
};

export const getPopularCourses = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 4. Pie/Bar Chart: Most popular courses
    const sql = `
      SELECT course_name, COUNT(*) as count 
      FROM course_certifications
      ${dateClause} 
      GROUP BY course_name 
      ORDER BY count DESC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular courses" });
  }
};

export const getGeoDistribution = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 5. World Map: Distribution by Country
    const sql = `
      SELECT certificate_country as country, COUNT(*) as count 
      FROM course_certifications
      ${dateClause} 
      GROUP BY certificate_country 
      ORDER BY count DESC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching geo data" });
  }
};


export const getStudentEngagement = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    const sql = `
      SELECT 
        CASE 
          WHEN cert_count = 1 THEN '1 Certificate'
          WHEN cert_count = 2 THEN '2 Certificates'
          WHEN cert_count BETWEEN 3 AND 5 THEN '3-5 Certificates'
          ELSE '5+ Certificates'
        END as category,
        COUNT(*) as student_count
      FROM (
        SELECT email_address, COUNT(*) as cert_count 
        FROM course_certifications
        ${dateClause} 
        GROUP BY email_address
      ) as subquery
      GROUP BY category
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching engagement stats" });
  }
};

// 7. Organization Analysis (Domain names)
// Visualization: Horizontal Bar Chart (Identify if users are Gmail/Yahoo or Corporate/University)
export const getEmailDomains = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    const sql = `
      SELECT 
        SUBSTRING_INDEX(email_address, '@', -1) as domain, 
        COUNT(*) as count 
      FROM course_certifications
      ${dateClause}
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 10
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching domains" });
  }
};

// 8. Specific Course Trends Over Time
// Visualization: Multi-Line Chart (Compare the growth of top courses side-by-side)
export const getCourseGrowth = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // This query groups by Date AND Course Name
    const sql = `
      SELECT 
        DATE(survey_created_at) as date, 
        course_name, 
        COUNT(*) as count 
      FROM course_certifications
      ${dateClause} 
      GROUP BY DATE(survey_created_at), course_name 
      ORDER BY date ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course growth" });
  }
};

// 9. Peak Activity Hours
// Visualization: Heatmap or Bar Chart (e.g., "Users are most active at 2 PM")
export const getActivityHours = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    const sql = `
      SELECT 
        HOUR(survey_created_at) as hour_of_day, 
        COUNT(*) as count 
      FROM course_certifications
      ${dateClause} 
      GROUP BY hour_of_day 
      ORDER BY hour_of_day ASC
    `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity hours" });
  }
};

// 10. Recent Activity Feed
// Visualization: List/Table Widget ("Live Feed")
export const getRecentCertificates = async (req: Request, res: Response) => {
  try {
    // No date filter usually needed for "Recent", but you can add it if you want context
    const sql = `
      SELECT 
        certificate_name, 
        course_name, 
        certificate_country, 
        survey_created_at 
      FROM course_certifications
      ORDER BY survey_created_at DESC 
      LIMIT 10
    `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent activity" });
  }
};


export const exportCertificatesToCSV = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    
    // Reuse your helper to get dates
    const { dateClause, params } = getDateFilter(startDate, endDate);

    // 1. Fetch RAW data (Change 'course_certifications' to your actual table name if different)
    const sql = `
      SELECT 
        certificate_name,
        email_address,
        course_name,
        certificate_country,
        DATE_FORMAT(survey_created_at, '%Y-%m-%d') as date
      FROM course_certifications 
      ${dateClause} 
      ORDER BY survey_created_at DESC
    `;

    const [rows]: any[] = await db.query(sql, params);

    // 2. Convert to CSV Format manually (Simple & Fast)
    // Header Row
    const headers = ["Student Name", "Email", "Course", "Country", "Date"];
    const csvRows = [headers.join(",")];

    // Data Rows
    rows.forEach((row: any) => {
      // Escape commas in data to prevent broken columns (e.g., "Doe, John" -> "Doe John")
      const safeRow = [
        `"${row.certificate_name || ''}"`,
        `"${row.email_address || ''}"`,
        `"${row.course_name || ''}"`,
        `"${row.certificate_country || ''}"`,
        `"${row.date || ''}"`,
      ];
      csvRows.push(safeRow.join(","));
    });

    const csvString = csvRows.join("\n");

    // 3. Send File to Browser
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=certificates_${startDate}_to_${endDate}.csv`);
    res.status(200).send(csvString);

  } catch (error) {
    console.error("Export failed:", error);
    res.status(500).json({ message: "Export failed" });
  }
};

export const getCourseSpecificStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, courseName } = req.query as { startDate: string; endDate: string; courseName: string };
    const { dateClause, params } = getDateFilter(startDate, endDate);

    const sql = `
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(DISTINCT email_address) as unique_students,
        MIN(survey_created_at) as first_certificate,
        MAX(survey_created_at) as last_certificate
      FROM course_certifications 
      ${dateClause} 
      AND course_name = ?
    `;

    const finalParams = [...params, courseName];

    // 👇 FIX: Add <RowDataPacket[]> here
    const [rows] = await db.query<RowDataPacket[]>(sql, finalParams);

    // Now TypeScript knows 'rows' is an array, so rows[0] is safe
    res.json(rows[0]);

  } catch (error) {
    console.error("Error fetching course detail:", error);
    res.status(500).json({ message: "Error fetching course detail" });
  }
};

export const searchStudent = async (req: Request, res: Response) => {
  try {
    const { query } = req.query as { query: string };
    if (!query || query.length < 2) return res.json([]);

    // FIX: Added all non-aggregated columns to the GROUP BY clause
    const sql = `
      SELECT 
        first_name,
        last_name,
        email_address,
        certificate_email,
        certificate_country,
        certificate_name,
        GROUP_CONCAT(course_name) as enrolled_courses
      FROM course_certifications 
      WHERE 
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email_address LIKE ?
      GROUP BY 
        email_address, 
        first_name, 
        last_name, 
        certificate_email, 
        certificate_country, 
        certificate_name
      LIMIT 10
    `;

    const searchTerm = `%${query}%`;
    // We need 3 params because there are 3 '?' in the WHERE clause
    const [rows] = await db.query(sql, [searchTerm, searchTerm, searchTerm]);
    res.json(rows);

  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// 2. UPDATE: Insert MULTIPLE courses
export const addCertificate = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      email_address,
      certificate_email,
      certificate_country,
      certificate_name,
      courses // <--- NOW AN ARRAY: ["UTC 1", "UTC 2"]
    } = req.body;

    // Validate that courses is an array
    if (!Array.isArray(courses) || courses.length === 0) {
        return res.status(400).json({ message: "No courses selected" });
    }

    const sql = `
      INSERT INTO course_certifications 
      (first_name, last_name, email_address, certificate_email, certificate_country, certificate_name, course_name, survey_created_at)
      VALUES ?
    `;

    // Create a row for EACH selected course
    const values = courses.map(course => [
      first_name,
      last_name,
      email_address,
      certificate_email || email_address,
      certificate_country,
      certificate_name,
      course, // The specific course
      new Date() // Current time
    ]);

    // Bulk Insert
    await db.query(sql, [values]);

    res.status(201).json({ message: "Courses added successfully" });

  } catch (error) {
    console.error("Insert failed:", error);
    res.status(500).json({ message: "Failed to add record" });
  }
};


export const getKpiDetails = async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query as { type: string, startDate: string, endDate: string };
    let sql = "";
    
    // Base WHERE clause
    const dateFilter = `WHERE survey_created_at BETWEEN ? AND ?`;

    switch (type) {
      case 'certificates':
        sql = `
          SELECT certificate_name, course_name, certificate_country, survey_created_at 
          FROM course_certifications 
          ${dateFilter} 
          ORDER BY survey_created_at DESC
        `;
        break;

      case 'students':
        // 🔴 FIXED: Added MAX() around certificate_name to satisfy GROUP BY rule
        sql = `
          SELECT 
            MAX(certificate_name) as certificate_name, 
            email_address, 
            COUNT(*) as certificate_count 
          FROM course_certifications 
          ${dateFilter} 
          GROUP BY email_address 
          ORDER BY certificate_count DESC
        `;
        break;

      case 'countries':
        sql = `
          SELECT certificate_country as country, COUNT(*) as count 
          FROM course_certifications 
          ${dateFilter} 
          GROUP BY certificate_country 
          ORDER BY count DESC
        `;
        break;

      case 'courses':
        sql = `
          SELECT course_name, COUNT(*) as count 
          FROM course_certifications 
          ${dateFilter} 
          GROUP BY course_name 
          ORDER BY count DESC
        `;
        break;
        
      default:
        return res.json([]);
    }

    const [rows] = await db.query(sql, [startDate, endDate]);
    res.json(rows);

  } catch (error) {
    console.error("KPI Details Error:", error);
    res.status(500).json({ message: "Failed to fetch details" });
  }
};


export const getCourseStudents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, courseName } = req.query as { startDate: string, endDate: string, courseName: string };
    
    const sql = `
      SELECT certificate_name, email_address, certificate_country, survey_created_at
      FROM course_certifications 
      WHERE 
        course_name = ? AND 
        survey_created_at BETWEEN ? AND ?
      ORDER BY survey_created_at DESC
    `;

    const [rows] = await db.query(sql, [courseName, startDate, endDate]);
    res.json(rows);

  } catch (error) {
    console.error("Course Students Error:", error);
    res.status(500).json({ message: "Failed to fetch list" });
  }
};