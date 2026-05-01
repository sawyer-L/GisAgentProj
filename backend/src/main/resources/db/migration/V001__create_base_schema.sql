-- GIS Agent Platform - Base Schema
-- Requires: PostgreSQL 15+, PostGIS extension

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Spatial Layers
-- ============================================
CREATE TABLE spatial_layers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    display_name    VARCHAR(200),
    layer_type      VARCHAR(50) NOT NULL DEFAULT 'vector',
    description     TEXT,
    style_config    JSONB,
    visible         BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spatial_layers_name ON spatial_layers(name);

-- ============================================
-- Spatial Features (PostGIS geometry)
-- ============================================
CREATE TABLE spatial_features (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layer_id        UUID NOT NULL REFERENCES spatial_layers(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    feature_type    VARCHAR(50) NOT NULL DEFAULT 'point',
    properties      JSONB,
    geom            GEOMETRY(GEOMETRY, 4326) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spatial_features_layer_id ON spatial_features(layer_id);
CREATE INDEX idx_spatial_features_geom ON spatial_features USING GIST(geom);
CREATE INDEX idx_spatial_features_name ON spatial_features(name);

-- ============================================
-- Agent Tasks
-- ============================================
CREATE TABLE agent_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type       VARCHAR(100) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    selected_feature VARCHAR(200),
    prompt          TEXT,
    layer_name      VARCHAR(200),
    summary         TEXT,
    recommendation  TEXT,
    report_title    VARCHAR(500),
    risk_level      VARCHAR(20),
    confidence      DOUBLE PRECISION,
    estimated_duration_minutes INT,
    nearby_features JSONB,
    evidence        JSONB,
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- ============================================
-- Agent Task Steps
-- ============================================
CREATE TABLE agent_task_steps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    step_name       VARCHAR(100) NOT NULL,
    step_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    result_data     JSONB,
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_task_steps_task_id ON agent_task_steps(task_id);

-- ============================================
-- AI Call Logs
-- ============================================
CREATE TABLE ai_call_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
    provider        VARCHAR(100) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    tokens_input    INT,
    tokens_output   INT,
    latency_ms      INT,
    status          VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_call_logs_task_id ON ai_call_logs(task_id);
CREATE INDEX idx_ai_call_logs_created_at ON ai_call_logs(created_at DESC);

-- ============================================
-- Seed Data: Default Layers
-- ============================================
INSERT INTO spatial_layers (name, display_name, layer_type, description, sort_order) VALUES
    ('risk-layer', 'Risk Points', 'vector', 'Identified risk and hazard points', 1),
    ('patrol-layer', 'Patrol Stations', 'vector', 'Field patrol station locations', 2),
    ('sensor-layer', 'Sensor Network', 'vector', 'IoT sensor beacon locations', 3);

-- ============================================
-- Seed Data: Demo Spatial Features
-- ============================================
INSERT INTO spatial_features (layer_id, name, feature_type, properties, geom)
SELECT l.id, '滨河泵站', 'point',
    '{"category": "核心资产", "status": "活跃"}'::jsonb,
    ST_SetSRID(ST_MakePoint(116.3975, 39.9085), 4326)
FROM spatial_layers l WHERE l.name = 'risk-layer';

INSERT INTO spatial_features (layer_id, name, feature_type, properties, geom)
SELECT l.id, '西北排水节点', 'point',
    '{"category": "排水风险", "status": "紧急"}'::jsonb,
    ST_SetSRID(ST_MakePoint(116.3850, 39.9150), 4326)
FROM spatial_layers l WHERE l.name = 'risk-layer';

INSERT INTO spatial_features (layer_id, name, feature_type, properties, geom)
SELECT l.id, '河流传感器信标', 'point',
    '{"category": "传感器警报", "status": "关注"}'::jsonb,
    ST_SetSRID(ST_MakePoint(116.3920, 39.9120), 4326)
FROM spatial_layers l WHERE l.name = 'sensor-layer';

INSERT INTO spatial_features (layer_id, name, feature_type, properties, geom)
SELECT l.id, '巡逻站A', 'point',
    '{"category": "支援资源", "status": "可用"}'::jsonb,
    ST_SetSRID(ST_MakePoint(116.4010, 39.9050), 4326)
FROM spatial_layers l WHERE l.name = 'patrol-layer';
