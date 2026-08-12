package mal_productivity.client;

import mal_productivity.dto.GitHubDeployment;
import mal_productivity.dto.GitHubPullRequest;
import mal_productivity.dto.GitHubWorkflowRun;
import mal_productivity.dto.GitHubWorkflowRunsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GitHubClient {

    private final RestClient restClient;

    public GitHubClient(
            RestClient.Builder builder,
            @Value("${github.token:}") String githubToken) {

        RestClient.Builder clientBuilder = builder
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28");

        if (githubToken != null && !githubToken.isBlank()) {
            clientBuilder.defaultHeader(
                    "Authorization",
                    "Bearer " + githubToken
            );
        }

        this.restClient = clientBuilder.build();
    }

    public List<GitHubPullRequest> getPullRequests(String owner, String repo) {
        List<GitHubPullRequest> response = restClient.get()
                .uri("/repos/{owner}/{repo}/pulls?state=all&per_page=100", owner, repo)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response == null ? List.of() : response;
    }

    public List<GitHubWorkflowRun> getWorkflowRuns(String owner, String repo) {
        GitHubWorkflowRunsResponse response = restClient.get()
                .uri("/repos/{owner}/{repo}/actions/runs?per_page=100", owner, repo)
                .retrieve()
                .body(GitHubWorkflowRunsResponse.class);

        if (response == null || response.workflowRuns() == null) {
            return List.of();
        }

        return response.workflowRuns();
    }

    public List<GitHubDeployment> getDeployments(String owner, String repo) {
        List<GitHubDeployment> response = restClient.get()
                .uri("/repos/{owner}/{repo}/deployments?per_page=100", owner, repo)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response == null ? List.of() : response;
    }
}