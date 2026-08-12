package mal_productivity.dto;

public record ProductivityMetrics(
        long deploymentsLast7Days,
        double averageLeadTimeHours,
        long mergedPullRequestsLast7Days,
        double ciSuccessRate
) {
}