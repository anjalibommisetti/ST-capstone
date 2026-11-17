package com.testfusion.repository;

import com.testfusion.model.Project;
import com.testfusion.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserOrderByCreatedAtDesc(User user);
    List<Project> findAllByOrderByCreatedAtDesc();
}
