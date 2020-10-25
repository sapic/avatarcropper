import React, { useLayoutEffect, useRef } from "react";

const useLayoutEffectNI = (fn, deps) =>
{
    const didMount = useRef(false);

    useLayoutEffect(() =>
    {
        if (didMount.current)
        {
            fn();
        }
        else
        {
            didMount.current = true;
        }
    }, deps);
};

export default useLayoutEffectNI;