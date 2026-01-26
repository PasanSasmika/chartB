import { Router } from "express";
import { 
    getDashboardStats, 
    getCertificateTrends, 
    getTopStudents, 
    getPopularCourses, 
    getGeoDistribution, 
    getRecentCertificates,
    getActivityHours,
    getCourseGrowth,
    getEmailDomains,
    getStudentEngagement,
    exportCertificatesToCSV,
    getCourseSpecificStats,
    searchStudent,
    addCertificate,
    getKpiDetails,
    getCourseStudents,
    getAllCertificates
} from "../controllers/analyticsController.js";

const analyticsRoutes = Router();

// Endpoint: /api/analytics/stats?startDate=2025-01-01&endDate=2025-12-31
analyticsRoutes.get("/stats", getDashboardStats);

// Endpoint: /api/analytics/trend (Line Chart)
analyticsRoutes.get("/trend", getCertificateTrends);

// Endpoint: /api/analytics/top-students (Bar Chart)
analyticsRoutes.get("/top-students", getTopStudents);

// Endpoint: /api/analytics/popular-courses (Pie Chart)
analyticsRoutes.get("/popular-courses", getPopularCourses);

// Endpoint: /api/analytics/geo (World Map)
analyticsRoutes.get("/geo", getGeoDistribution);

analyticsRoutes.get("/engagement", getStudentEngagement);

// 2. Domains: /api/analytics/domains (Horizontal Bar Chart)
analyticsRoutes.get("/domains", getEmailDomains);

// 3. Course Growth: /api/analytics/course-growth (Multi-line Chart)
analyticsRoutes.get("/course-growth", getCourseGrowth);

// 4. Activity Hours: /api/analytics/activity-hours (Heatmap/Bar)
analyticsRoutes.get("/activity-hours", getActivityHours);

// 5. Recent Feed: /api/analytics/recent (List Widget)
analyticsRoutes.get("/recent", getRecentCertificates);

analyticsRoutes.get("/export", exportCertificatesToCSV);

analyticsRoutes.get("/course-detail", getCourseSpecificStats);

analyticsRoutes.get("/search", searchStudent);

analyticsRoutes.post("/add", addCertificate);

analyticsRoutes.get("/kpi-details", getKpiDetails);

analyticsRoutes.get("/course-students", getCourseStudents);

analyticsRoutes.get("/all-certificates", getAllCertificates);
export default analyticsRoutes;