export default (err, req, res, next) => {
  console.log("에러 미들웨어 발동.");
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ errorMsg: err.message });
  }

  return res.status(500).json({ errorMsg: "서버에서 에러가 발생했습니다." });
};
