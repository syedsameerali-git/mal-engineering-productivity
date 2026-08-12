package mal_productivity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubPullRequest(
        long id,
        int number,
        String title,
        String state,

        @JsonProperty("created_at")
        OffsetDateTime createdAt,

        @JsonProperty("updated_at")
        OffsetDateTime updatedAt,

        @JsonProperty("closed_at")
        OffsetDateTime closedAt,

        @JsonProperty("merged_at")
        OffsetDateTime mergedAt
) {
}