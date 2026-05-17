package com.talentbridge.api;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Service
class LlmProviderService {

  private static final Logger logger = LoggerFactory.getLogger(LlmProviderService.class);
  private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

  private final JpaTalentBridgeStore jpaStore;
  private final OkHttpClient httpClient = new OkHttpClient();
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final String openAiKey;
  private final String geminiKey;
  private final String anthropicKey;

  LlmProviderService(
      JpaTalentBridgeStore jpaStore,
      @Value("${app.llm.openai-key:}") String openAiKey,
      @Value("${app.llm.gemini-key:}") String geminiKey,
      @Value("${app.llm.anthropic-key:}") String anthropicKey) {
    this.jpaStore = jpaStore;
    this.openAiKey = openAiKey;
    this.geminiKey = geminiKey;
    this.anthropicKey = anthropicKey;
  }

  StructuredJdResponse parseJd(String rawText) {
    return generateStructuredJd(
        "Parse this job description into a JSON object with the keys aboutCompany, aboutRole, requiredSkills, experienceRequired, compensationAndBenefits, workingHoursAndTimings, and location. "
            + "Return only valid JSON.\n\nJob description:\n"
            + safeText(rawText),
        safeText(rawText));
  }

  StructuredJdResponse generateJd(List<String> answers) {
    String joinedAnswers = answers == null ? "" : String.join("\n", answers);
    return generateStructuredJd(
        "Turn these intake answers into a JSON object with the keys aboutCompany, aboutRole, requiredSkills, experienceRequired, compensationAndBenefits, workingHoursAndTimings, and location. "
            + "Return only valid JSON.\n\nAnswers:\n"
            + safeText(joinedAnswers),
        joinedAnswers);
  }

  IntakeMessageResponse nextIntakeMessage(IntakeMessageRequest request) {
    String prompt = buildIntakePrompt(request);
    String aiMessage = callTextModel(prompt);
    if (!StringUtils.hasText(aiMessage)) {
      return fallbackIntakeMessage(request);
    }
    return new IntakeMessageResponse(aiMessage.trim(), true, request.step());
  }

  private StructuredJdResponse generateStructuredJd(String prompt, String fallbackSourceText) {
    String responseText = callTextModel(prompt);
    if (!StringUtils.hasText(responseText)) {
      return StructuredJdResponse.fromRawText(fallbackSourceText);
    }

    String jsonText = extractJsonBlock(responseText);
    if (!StringUtils.hasText(jsonText)) {
      return StructuredJdResponse.fromRawText(fallbackSourceText);
    }

    try {
      JsonNode node = objectMapper.readTree(jsonText);
      return new StructuredJdResponse(
          readText(node, "aboutCompany", fallbackSection(fallbackSourceText, "About the Company")),
          readText(node, "aboutRole", fallbackSection(fallbackSourceText, "About the Role")),
          readText(node, "requiredSkills", fallbackSection(fallbackSourceText, "Required Skills")),
          readText(node, "experienceRequired", fallbackSection(fallbackSourceText, "Experience Required")),
          readText(node, "compensationAndBenefits", fallbackSection(fallbackSourceText, "Compensation and Benefits")),
          readText(node, "workingHoursAndTimings", fallbackSection(fallbackSourceText, "Working Hours and Timings")),
          readText(node, "location", fallbackSection(fallbackSourceText, "Location")));
    } catch (Exception exception) {
      logger.debug("Failed to parse structured JD response", exception);
      return StructuredJdResponse.fromRawText(fallbackSourceText);
    }
  }

  private IntakeMessageResponse fallbackIntakeMessage(IntakeMessageRequest request) {
    String step = request.step() == null ? "" : request.step();
    String message = switch (step) {
      case "drive-type" -> "Do you have a complete Job Description ready?";
      case "jd-ready" -> "Would you like to upload a PDF or DOCX, or paste the text directly?";
      case "jd-missing" -> "Tell me the role title and a short overview of responsibilities.";
      default -> "Please continue with the next intake step.";
    };
    return new IntakeMessageResponse(message, true, step);
  }

  private String buildIntakePrompt(IntakeMessageRequest request) {
    StringBuilder builder = new StringBuilder();
    builder.append("You are an assistant for TalentBridge, a hiring requirements platform. ");
    builder.append("Ask exactly one short, helpful next question. Do not add bullets or explanations.\n\n");
    builder.append("Current step: ").append(safeText(request.step())).append('\n');
    if (request.answers() != null && !request.answers().isEmpty()) {
      builder.append("Answers: ").append(request.answers()).append('\n');
    }
    return builder.toString();
  }

  private String callTextModel(String prompt) {
    LlmProvider provider = jpaStore.getLlmSettings().activeProvider();
    try {
      return switch (provider) {
        case openai -> callOpenAi(prompt);
        case gemini -> callGemini(prompt);
        case claude -> callAnthropic(prompt);
      };
    } catch (Exception exception) {
      logger.warn("LLM provider call failed for {}", provider, exception);
      return "";
    }
  }

  private String callOpenAi(String prompt) throws IOException {
    if (!StringUtils.hasText(openAiKey)) {
      return "";
    }
    String payload = "{" +
        "\"model\":\"gpt-4o-mini\"," +
        "\"messages\":[{" +
          "\"role\":\"system\",\"content\":\"You are a precise hiring assistant. Return only the requested output.\"" +
        "},{" +
          "\"role\":\"user\",\"content\":\"" + escapeJson(prompt) + "\"" +
        "}]" +
        "}";
    return executeTextRequest("https://api.openai.com/v1/chat/completions", payload, "Authorization", "Bearer " + openAiKey, response -> {
      JsonNode root = objectMapper.readTree(response);
      JsonNode choices = root.path("choices");
      if (choices.isArray() && !choices.isEmpty()) {
        return choices.get(0).path("message").path("content").asText("");
      }
      return "";
    });
  }

  private String callGemini(String prompt) throws IOException {
    if (!StringUtils.hasText(geminiKey)) {
      return "";
    }
    String payload = "{" +
        "\"contents\":[{" +
          "\"parts\":[{\"text\":\"" + escapeJson(prompt) + "\"}]" +
        "}]" +
        "}";
    String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiKey;
    return executeTextRequest(url, payload, null, null, response -> {
      JsonNode root = objectMapper.readTree(response);
      JsonNode candidates = root.path("candidates");
      if (candidates.isArray() && !candidates.isEmpty()) {
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (parts.isArray() && !parts.isEmpty()) {
          return parts.get(0).path("text").asText("");
        }
      }
      return "";
    });
  }

  private String callAnthropic(String prompt) throws IOException {
    if (!StringUtils.hasText(anthropicKey)) {
      return "";
    }
    String payload = "{" +
        "\"model\":\"claude-3-5-sonnet-latest\"," +
        "\"max_tokens\":512," +
        "\"messages\":[{" +
          "\"role\":\"user\",\"content\":\"" + escapeJson(prompt) + "\"" +
        "}]" +
        "}";
    return executeTextRequest("https://api.anthropic.com/v1/messages", payload, "x-api-key", anthropicKey, response -> {
      JsonNode root = objectMapper.readTree(response);
      JsonNode content = root.path("content");
      if (content.isArray() && !content.isEmpty()) {
        return content.get(0).path("text").asText("");
      }
      return "";
    }, "anthropic-version", "2023-06-01");
  }

  private String executeTextRequest(String url, String payload, String headerName, String headerValue, ResponseExtractor extractor, String... additionalHeaders) throws IOException {
    Request.Builder builder = new Request.Builder().url(url).post(RequestBody.create(payload, JSON));
    if (StringUtils.hasText(headerName) && StringUtils.hasText(headerValue)) {
      builder.header(headerName, headerValue);
    }
    for (int index = 0; index + 1 < additionalHeaders.length; index += 2) {
      builder.header(additionalHeaders[index], additionalHeaders[index + 1]);
    }
    if (headerName == null) {
      builder.header("Content-Type", "application/json");
    }
    try (Response response = httpClient.newCall(builder.build()).execute()) {
      if (!response.isSuccessful() || response.body() == null) {
        return "";
      }
      return extractor.extract(response.body().string());
    }
  }

  private String extractJsonBlock(String responseText) {
    int start = responseText.indexOf('{');
    int end = responseText.lastIndexOf('}');
    if (start < 0 || end <= start) {
      return "";
    }
    return responseText.substring(start, end + 1);
  }

  private String readText(JsonNode node, String fieldName, String fallbackSourceText) {
    String value = node.path(fieldName).asText("");
    if (StringUtils.hasText(value)) {
      return value;
    }
    return fallbackSourceText;
  }

  private String fallbackSection(String sourceText, String heading) {
    String summary = StructuredJdResponse.fromRawText(sourceText).aboutCompany();
    int newline = summary.indexOf('\n');
    String body = newline >= 0 ? summary.substring(newline + 1) : summary;
    return heading + "\n" + body;
  }

  private String escapeJson(String value) {
    return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
  }

  private String safeText(String value) {
    return value == null ? "" : value.trim();
  }

  @FunctionalInterface
  private interface ResponseExtractor {
    String extract(String responseBody) throws IOException;
  }
}