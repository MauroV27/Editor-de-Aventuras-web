import { Router } from "express";
import { connectPageRoutes } from './pages.js';
import { connectAdventureRoutes } from "./adventure.js";

const routes = Router();

connectAdventureRoutes(routes);
connectPageRoutes(routes);

export { routes };