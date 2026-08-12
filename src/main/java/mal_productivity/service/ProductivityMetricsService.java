package mal_productivity.service;

import mal_productivity.client.GitHubClient;
import mal_productivity.dto.GitHubDeployment;
import mal_productivity.dto.GitHubPullRequest;
import mal_productivity.dto.GitHubWorkflowRun;
import mal_productivity.dto.ProductivityMetrics;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ProductivityMetricsService {

    private final GitHubClient gitHubClient;

    public ProductivityMetricsService(GitHubClient gitHubClient) {
        this.gitHubClient = gitHubClient;
    }

    public ProductivityMetrics calculate(String owner, String repo) {

        List<GitHubPullRequest> pullRequests =
                gitHubClient.getPullRequests(owner, repo);

        List<GitHubWorkflowRun> workflowRuns =
                gitHubClient.getWorkflowRuns(owner, repo);

        List<GitHubDeployment> deployments =
                gitHubClient.getDeployments(owner, repo);

        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7);

        long deploymentsLast7Days = deployments.stream()
                .filter(deployment -> deployment.createdAt() != null)
                .filter(deployment ->
                        deployment.createdAt().isAfter(sevenDaysAgo))
                .count();

        List<GitHubPullRequest> mergedPrs = pullRequests.stream()
                .filter(pr -> pr.mergedAt() != null)
                .toList();

        double averageLeadTimeHours = mergedPrs.stream()
                .filter(pr -> pr.createdAt() != null)
                .mapToLong(pr ->
                        Duration.between(
                                pr.createdAt(),
                                pr.mergedAt()
                        ).toMinutes())
                .average()
                .orElse(0.0) / 60.0;

        long mergedPullRequestsLast7Days = mergedPrs.stream()
                .filter(pr ->
                        pr.mergedAt().isAfter(sevenDaysAgo))
                .count();
        
        long completedRuns = workflowRuns.stream()
                .filter(run -> "completed".equals(run.status()))
                .count();

        long successfulRuns = workflowRuns.stream()
                .filter(run -> "completed".equals(run.status()))
                .filter(run -> "success".equals(run.conclusion()))
                .count();

        double ciSuccessRate = completedRuns == 0
                ? 0.0
                : ((double) successfulRuns / completedRuns) * 100;

        return new ProductivityMetrics(
                deploymentsLast7Days,
                round(averageLeadTimeHours),
                mergedPullRequestsLast7Days,
                round(ciSuccessRate)
        );
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}