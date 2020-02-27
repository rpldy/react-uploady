import React, { forwardRef, useRef } from "react";
import { mount } from "enzyme";
import useWithForwardRef from "../useWithForwardRef";

describe("useSetLayoutRef tests", () => {
    const Comp = forwardRef((props, ref) => {
        const {ref: divRef, setRef } = useWithForwardRef(ref);

        if (props.test) {
            props.test(divRef);
        }

        return <div id="test" ref={setRef} />;
    });

    it("should support ref in object form", () => {
        let refObj;
        const Test = () => {
            refObj = useRef(undefined);
            return <Comp ref={refObj} />;
        };

        mount(<Test />);

        expect(refObj.current).toBeDefined();
    });

    it("should support ref in function form", () => {
        let refFn = jest.fn();
        const Test = () => {
            return <Comp ref={refFn} />;
        };

        mount(<Test />);

        expect(refFn).toHaveBeenCalled();
    });

    it("should work without ref", (done) => {
        const wrapper = mount(<Comp />);

        const test = (ref) => {
            expect(ref.current).toBeTruthy();
            done();
        };

        wrapper.setProps({test});
    });
});
