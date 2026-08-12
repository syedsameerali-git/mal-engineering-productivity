package mal_productivity.dto;

public record ProductivityMetrics(
        long deploymentsLast7Days,
        double averageLeadTimeHours,
        double averagePrReviewTimeHours,
        long mergedPullRequestsLast7Days
) {
}