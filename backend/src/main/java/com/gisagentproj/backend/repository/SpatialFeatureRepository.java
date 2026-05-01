package com.gisagentproj.backend.repository;

import com.gisagentproj.backend.entity.SpatialFeature;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpatialFeatureRepository extends JpaRepository<SpatialFeature, UUID> {

    List<SpatialFeature> findByLayerName(String layerName);

    List<SpatialFeature> findByName(String name);

    @Query(value = """
        SELECT sf.* FROM spatial_features sf
        JOIN spatial_layers sl ON sf.layer_id = sl.id
        WHERE sl.name = :layerName
        AND ST_DWithin(
            sf.geom::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radiusMeters
        )
        ORDER BY ST_Distance(
            sf.geom::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )
        """, nativeQuery = true)
    List<SpatialFeature> findNearby(
        @Param("layerName") String layerName,
        @Param("lng") double longitude,
        @Param("lat") double latitude,
        @Param("radiusMeters") double radiusMeters
    );

    @Query(value = """
        SELECT sf.* FROM spatial_features sf
        WHERE ST_DWithin(
            sf.geom::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radiusMeters
        )
        ORDER BY ST_Distance(
            sf.geom::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )
        """, nativeQuery = true)
    List<SpatialFeature> findNearbyAllLayers(
        @Param("lng") double longitude,
        @Param("lat") double latitude,
        @Param("radiusMeters") double radiusMeters
    );
}
