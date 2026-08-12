package mal_productivity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubDeployment(
        long id,
        String environment,

        @JsonProperty("created_at")
        OffsetDateTime createdAt
) {
}