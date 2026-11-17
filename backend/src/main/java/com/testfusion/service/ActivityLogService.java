package com.testfusion.service;

import com.testfusion.model.ActivityLog;
import com.testfusion.model.User;
import com.testfusion.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(User user, String action, String entityType, Long entityId, String details) {
        try {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setDetails(details);
            log.setTimestamp(LocalDateTime.now());
            activityLogRepository.save(log);
        } catch (Exception e) {
            // Non-critical logging failure should not interrupt main operations
        }
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop20ByOrderByTimestampDesc();
    }

    public List<ActivityLog> getUserLogs(User user) {
        return activityLogRepository.findByUserOrderByTimestampDesc(user);
    }
}
