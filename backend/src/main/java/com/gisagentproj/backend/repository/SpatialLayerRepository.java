package com.gisagentproj.backend.repository;

import com.gisagentproj.backend.entity.SpatialLayer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpatialLayerRepository extends JpaRepository<SpatialLayer, UUID> {

    Optional<SpatialLayer> findByName(String name);

    List<SpatialLayer> findByVisibleTrueOrderBySortOrder();
}
