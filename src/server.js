/* server는 always request를 listening 하고 있다. */
/* node_modules/express 에서 익스프레스를 가져온다.*/
import express from "express";
import morgan from "morgan";
import global from "./routers/globalRouter";
import video from "./routers/videoRouter";
import user from "./routers/userRouter";

/* request를 받는 PORT를 설정한다. 
PORT는 내 컴퓨터로의 창이나 문 같은것.
4000번을 쓰는 것은 백엔드 관습이기도 하고, 거의 항상 비어있다. */
const PORT = 4000;
/* express함수를 호출하면 express application을 바로 사용할 수
있게 return 해준다. 모든 것은 app에 있다. */
const app = express();
const logger = morgan("dev");

app.set("view engine","pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true}));
app.use("/",global);
app.use("/videos",video);
app.use("/users",user);


const handleListening = () => console.log(`Server listening on port http://localhost:${PORT}`);
/* 4000PORT로 들어오는 request를 감지하고 handelListening 함수를 실행시킨다. */
app.listen(PORT, handleListening);

