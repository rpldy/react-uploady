import { css } from "styled-components";

export default css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 400px;
    border: 1px dotted #000;

    #drop-text {
      display: none;
    }

    &.drag-over {
      background-color: rgba(114,255,59,0.6);
        #drop-text {
          display: block;
        }

        #drag-text {
          display: none;
        }
    }
`;
