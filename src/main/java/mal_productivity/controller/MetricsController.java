package mal_productivity.controller;

import mal_productivity.dto.ProductivityMetrics;
import mal_productivity.service.ProductivityMetricsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final ProductivityMetricsService metricsService;

    public MetricsController(ProductivityMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping
    public ProductivityMetrics getMetrics(
            @RequestParam String owner,
            @RequestParam String repo) {

        return metricsService.calculate(owner, repo);
    }
}