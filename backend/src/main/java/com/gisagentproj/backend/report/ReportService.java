package com.gisagentproj.backend.report;

import org.springframework.stereotype.Service;

@Service
public class ReportService {

    public String buildReportTitle(String taskId) {
        return "Agent Report - " + taskId;
    }
}
