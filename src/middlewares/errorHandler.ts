import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/customError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.status).send({ message: err.message });
  }

  if (err.status === 404) {
    return res.status(404).send({ message: "404 Page Not Found" });
  }

  const response = {
    message: err.message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  };

  res.status(err.status || 500).json(response);
};

export default errorHandler;
