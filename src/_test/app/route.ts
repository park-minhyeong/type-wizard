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
	name: { type: 'string', optional: true },
	age: { type: 'number' },
	email: { type: 'string' },
	birthDate: { type: 'date' },
	tags: { type: 'array', of: { type: 'string' } },
	settings: {
		type: 'object',
		of: {
			notifications: { type: 'boolean' },
			theme: { type: 'string', enum: ['light', 'dark'] }
		}
	}
});

// 테스트 API 엔드포인트
defaultRouter.post("/", async (req, res) => {
	try {
		if (!isUserData(req.body)) {
			return res.status(400).send(isUserData.message(req.body));
		}
		return res.send("Type Guard Test API Server");
	}
	catch (e) {
		return res.status(500)
	}
});


export default defaultRouter;
