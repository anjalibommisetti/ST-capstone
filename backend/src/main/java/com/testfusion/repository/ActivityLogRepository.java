package com.testfusion.repository;

import com.testfusion.model.ActivityLog;
import com.testfusion.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByOrderByTimestampDesc();
    List<ActivityLog> findByUserOrderByTimestampDesc(User user);
}
