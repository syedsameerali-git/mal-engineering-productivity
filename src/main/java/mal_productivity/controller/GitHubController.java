package mal_productivity.controller;

import mal_productivity.client.GitHubClient;
import mal_productivity.dto.GitHubDeployment;
import mal_productivity.dto.GitHubPullRequest;
import mal_productivity.dto.GitHubWorkflowRun;
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

    @GetMapping("/workflow-runs")
    public List<GitHubWorkflowRun> getWorkflowRuns(
            @RequestParam String owner,
            @RequestParam String repo) {

        return gitHubClient.getWorkflowRuns(owner, repo);
    }

    @GetMapping("/deployments")
    public List<GitHubDeployment> getDeployments(
            @RequestParam String owner,
            @RequestParam String repo) {

        return gitHubClient.getDeployments(owner, repo);
    }
}