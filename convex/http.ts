import { httpRouter } from "convex/server";
import router from "./router";
import { auth } from "./auth";

const http = router;

auth.addHttpRoutes(http);

export default http;
