import { TypeView } from "typeview";

const main = async () => {
  const tv = new TypeView({ title: "TypeView Demo" });

  tv.addSlide({
    title: "Hello",
    content: "Welcome to TypeView 👋",
  });

  await tv.run();
};

main();
