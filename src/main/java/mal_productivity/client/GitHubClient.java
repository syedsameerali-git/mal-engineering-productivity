package mal_productivity.client;

import mal_productivity.dto.GitHubPullRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GitHubClient {

    private final RestClient restClient;

    public GitHubClient(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    public List<GitHubPullRequest> getPullRequests(String owner, String repo) {
        List<GitHubPullRequest> response = restClient.get()
                .uri("/repos/{owner}/{repo}/pulls?state=all&per_page=100",
                        owner, repo)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response == null ? List.of() : response;
    }
}