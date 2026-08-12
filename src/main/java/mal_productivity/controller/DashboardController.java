package mal_productivity.controller;

import mal_productivity.dto.ProductivityMetrics;
import mal_productivity.service.ProductivityMetricsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductivityMetricsService metricsService;

    public DashboardController(ProductivityMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/engineering")
    public Map<String, Object> engineeringDashboard(
            @RequestParam String owner,
            @RequestParam String repo) {

        ProductivityMetrics metrics = metricsService.calculate(owner, repo);

        return Map.of(
                "audience", "Engineering Lead",
                "repository", owner + "/" + repo,
                "metrics", metrics
        );
    }

    @GetMapping("/executive")
    public Map<String, Object> executiveDashboard(
            @RequestParam String owner,
            @RequestParam String repo) {

        ProductivityMetrics metrics = metricsService.calculate(owner, repo);

        return Map.of(
                "audience", "CEO Office",
                "deliveryHealth", metrics
        );
    }
}