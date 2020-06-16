import makeUpdateable from "./index";

interface State {
    foo: string,
    bob: string,
}

const testUpdateable = (): void => {

    const { state, update, unwrap } = makeUpdateable<State>({
        foo: "bar",
        bob: "mcintyre",
    });

    console.log(state.foo);

    update((state)=> {
       state.bob = "alice";
    });

    const org = unwrap();

    console.log(org);
};

export {
    testUpdateable,
};