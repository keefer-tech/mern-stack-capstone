export const getDate = (date) => {
  const formattedDate = date.slice(0, 10).split("-").reverse().join("-");
  return formattedDate;
};
