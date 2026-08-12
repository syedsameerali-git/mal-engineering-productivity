package mal_productivity.controller;

import mal_productivity.client.GitHubClient;
import mal_productivity.dto.GitHubPullRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubClient gitHubClient;

    public GitHubController(GitHubClient gitHubClient) {
        this.gitHubClient = gitHubClient;
    }

    @GetMapping("/pulls")
    public List<GitHubPullRequest> getPullRequests(
            @RequestParam String owner,
            @RequestParam String repo) {

        return gitHubClient.getPullRequests(owner, repo);
    }
}