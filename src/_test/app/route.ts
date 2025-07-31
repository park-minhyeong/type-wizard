import express from "express";
import { createTypeGuard } from "../../type-guard";

const defaultRouter = express.Router();

// 테스트용 타입 정의
type UserData = {
  name: string;
  age: number;
  email: string;
  birthDate: Date;
  tags: string[];
  settings: {
    notifications: boolean;
    theme: "light" | "dark";
  };
};

// 타입 가드 생성
const isUserData = createTypeGuard<UserData>({
  name: { type: "string", optional: true },
  age: { type: "number" },
  email: { type: "string", optional: true },
  birthDate: { type: "date" },
  tags: { type: "array", of: { type: "string" } },
  settings: {
    type: "object",
    of: {
      notifications: { type: "boolean" },
      theme: { type: "string", enum: ["light", "dark"] },
    },
  },
}).optional();

interface Test {
  id: number;
  name: string;
}

const isTest = createTypeGuard<Test>({
  id: { type: "number" },
  name: { type: "string" }
});

interface UserApi {
  id: number;
  json: JSON;
  users: UserData[];
}

const isUserApi = createTypeGuard<UserApi>({
  id: { type: "number" },
  json: { type: "json", of: isTest },
  users: { type: "array", of: isUserData },
});

// 테스트 API 엔드포인트
defaultRouter.post("/", async (req, res) => {
  try {
    if (!isUserApi(req.body)) {
      return res.status(400).json({
        error: "Validation failed",
        message: isUserApi.message(req.body)
      });
    }
    return res.json({
      success: true,
      message: "Type Guard Test API Server",
      data: req.body
    });
  } catch (e) {
    return res.status(500).json({
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    });
  }
});

// JSON 에러 테스트 엔드포인트
defaultRouter.post("/test-json-errors", async (req, res) => {
  const testCases = [
    { name: "Date 객체", value: { json: new Date() } },
    { name: "RegExp 객체", value: { json: /test/ } },
    { name: "Error 객체", value: { json: new Error("test") } },
    { name: "Map 객체", value: { json: new Map([["key", "value"]]) } },
    { name: "Set 객체", value: { json: new Set([1, 2, 3]) } },
    { name: "함수", value: { json: () => {} } },
    { name: "순환 참조", value: (() => { const obj: any = {}; obj.self = obj; return { json: obj }; })() },
    { name: "BigInt", value: { json: BigInt(123) } },
    { name: "Symbol", value: { json: Symbol("test") } },
    { name: "null", value: { json: null } },
    { name: "undefined", value: { json: undefined } },
    { name: "문자열", value: { json: "string" } },
    { name: "숫자", value: { json: 123 } },
    { name: "불린", value: { json: true } }
  ];

  const results = testCases.map(testCase => {
    const isValid = isUserApi(testCase.value);
    return {
      testCase: testCase.name,
      value: testCase.value,
      isValid,
      errorMessage: isValid ? null : isUserApi.message(testCase.value)
    };
  });

  return res.json({
    testResults: results
  });
});

// 간단한 JSON 테스트 엔드포인트
defaultRouter.post("/test-simple", async (req, res) => {
  const testData = {
    id: 1,
    json: { id: "string", name: 123 }, // name이 string이어야 하는데 number
    users: []
  };

  if (!isUserApi(testData)) {
    return res.status(400).json({
      error: "Validation failed",
      message: isUserApi.message(testData)
    });
  }

  return res.json({
    success: true,
    message: "Validation passed"
  });
});

export default defaultRouter;
