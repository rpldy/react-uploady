import addLife, { createLifePack } from "./index";

const testAddLife = (): void => {
    const obj = {};

    const lifeApi = addLife(obj, ["test", "test2"], {
        allowRegisterNonExistent: true,
        canAddEvents: false,
    });

    lifeApi.target.on("test", (a: number, b: number) => {
        console.log("event test triggered", a, b);
    });

    lifeApi.trigger("test", 1, 2);
};

const testCreateLifePack = (): void => {

    const creator = () => {
        return "value";
    };

    const lp = createLifePack<string>(creator);

    lp.resolve();
};

export {
    testAddLife,
    testCreateLifePack,
};
