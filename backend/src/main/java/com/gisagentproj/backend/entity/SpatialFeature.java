package com.gisagentproj.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "spatial_features")
public class SpatialFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "layer_id", nullable = false)
    private SpatialLayer layer;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "feature_type", nullable = false, length = 50)
    private String featureType = "point";

    @Column(columnDefinition = "JSONB")
    private String properties;

    @Column(columnDefinition = "GEOMETRY(GEOMETRY, 4326)", nullable = false)
    private Geometry geom;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public UUID getId() { return id; }
    public SpatialLayer getLayer() { return layer; }
    public void setLayer(SpatialLayer layer) { this.layer = layer; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFeatureType() { return featureType; }
    public void setFeatureType(String featureType) { this.featureType = featureType; }
    public String getProperties() { return properties; }
    public void setProperties(String properties) { this.properties = properties; }
    public Geometry getGeom() { return geom; }
    public void setGeom(Geometry geom) { this.geom = geom; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
