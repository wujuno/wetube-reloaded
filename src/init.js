import "dotenv/config";
import "./db";
import "./models/video";
import "./models/user";
import "./models/comment";
import app from "./server"

const PORT = process.env.PORT || 4000;

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT}`);
/* 4000PORT로 들어오는 request를 감지하고 handelListening 함수를 실행시킨다. */
app.listen(PORT, handleListening);