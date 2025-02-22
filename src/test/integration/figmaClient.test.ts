import { expect } from "chai";
import nock from "nock"; // Changed import
import { FigmaClient } from "../../api/figmaClient";
import { FigmaApiError } from "../../types/figma";

describe("FigmaClient Integration", () => {
  const API_TOKEN = "test-token";
  const FILE_ID = "test-file-id";
  let client: FigmaClient;

  beforeEach(() => {
    client = new FigmaClient(API_TOKEN);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should fetch file comments successfully", async () => {
    const mockComments = [{ id: "1", message: "Test comment" }];

    nock("https://api.figma.com/v1")
      .get(`/files/${FILE_ID}/comments`)
      .reply(200, { comments: mockComments });

    const comments = await client.getFileComments(FILE_ID);
    expect(comments).to.deep.equal(mockComments);
  });

  it("should handle API errors appropriately", async () => {
    nock("https://api.figma.com/v1")
      .get(`/files/${FILE_ID}/comments`)
      .reply(401, { error: "Invalid token" });

    try {
      await client.getFileComments(FILE_ID);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).to.be.instanceOf(FigmaApiError);
      if (error instanceof FigmaApiError) {
        expect(error.status).to.equal(401);
      }
    }
  });
});
