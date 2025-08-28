Write test specs
Overlay for blok1, blok2, blok3, blok4
Add deadlines, exams, assessments to settings file
Add multiple courses to settings file (GRC)
Check if settings can be read from Brigthspace
If day is not found it shall display no overlay at all
If course is not found it shall display no overlay at all (or select course?)
Ensure buttons only work in month view (or else select month view)


  OpenTelemetry Logging Architecture Plan

  1. Current State Assessment

  - You have a basic logging utility in config.js:53-66 with console-based logging
  - Extension has multiple components: popup, content scripts, calendar overlays
  - Current logging is debug/console focused with no structured telemetry

  2. OpenTelemetry Integration Strategy

  Core Components:
  - Instrumentation Layer: Replace existing logger with OpenTelemetry SDK
  - Trace Context: Propagate across popup → content script → DOM interactions
  - Resource Detection: Identify extension version, browser info, page context
  - Exporter Configuration: Send to OTLP-compatible backend

  3. Implementation Architecture

  Phase 1: Foundation
  - Install @opentelemetry/api, @opentelemetry/sdk-browser, @opentelemetry/auto-instrumentations-web
  - Create centralized telemetry service in telemetry.js
  - Replace existing logger in config.js with OTel logger

  Phase 2: Instrumentation
  - Add span creation for overlay operations (select_day, select_sprint1, etc.)
  - Instrument DOM interactions and calendar element detection
  - Track user interactions (button clicks, overlay toggles)
  - Monitor error rates and performance metrics

  Phase 3: Context Propagation
  - Implement trace context between popup and content scripts
  - Correlate user actions with DOM manipulations
  - Track overlay lifecycle events

  4. Key Metrics & Traces

  - Spans: Overlay creation/removal, calendar detection, settings loading
  - Metrics: Button click rates, overlay success/failure rates, DOM query performance
  - Logs: Structured logs with trace correlation for debugging
  - Errors: Exception tracking with full context

  5. Export Strategy

  - Use OTLP HTTP exporter for cloud backends (Jaeger, Grafana, etc.)
  - Consider browser storage for offline scenarios
  - Implement sampling to manage data volume

