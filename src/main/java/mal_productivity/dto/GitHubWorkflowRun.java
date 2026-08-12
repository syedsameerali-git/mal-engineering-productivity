package mal_productivity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubWorkflowRun(
        long id,
        String name,
        String status,
        String conclusion,

        @JsonProperty("created_at")
        OffsetDateTime createdAt,

        @JsonProperty("updated_at")
        OffsetDateTime updatedAt,

        @JsonProperty("run_started_at")
        OffsetDateTime runStartedAt
) {
}