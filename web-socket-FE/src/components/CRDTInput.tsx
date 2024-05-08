import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  Doc,
  applyUpdateV2,
  diffUpdateV2,
  encodeSnapshot,
  encodeStateAsUpdateV2,
  snapshot,
} from "yjs";

interface CRDTInput {
  socket: Socket;
}

const CRDTInput = ({ socket }: CRDTInput) => {
  const [inputData, setInputData] = useState<string>("");
  const [cursorPoint, setCursorPoint] = useState<number>(0);
  const yDocRef = useRef<Doc>(new Doc());

  const handleOnChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const newData = target.value;
    const newCursor = target.selectionStart ?? 0;

    setInputData(newData);
    setCursorPoint(newCursor);

    const beforeUpdate = encodeSnapshot(snapshot(yDocRef.current));

    const changedLength = newData.length - inputData.length;
    const added =
      changedLength > 0 ? "ADD" : changedLength === 0 ? "EQUAL" : "DELETE";
    const changed = newData !== inputData;

    const onAdd = () => {
      const startPoint = newCursor - Math.abs(changedLength);
      const addedText = newData.slice(startPoint, newCursor);
      yDocRef.current.getText("myText").insert(startPoint, addedText);
    };

    const onEqual = (changed: boolean) => {
      if (!changed) return;
      const startPoint = newCursor - 1;
      const updatedText = newData.slice(startPoint, newCursor);

      yDocRef.current.getText("myText").delete(newCursor - 1, 1);
      yDocRef.current.getText("myText").insert(newCursor - 1, updatedText);
    };

    const onDelete = () => {
      yDocRef.current
        .getText("myText")
        .delete(newCursor, Math.abs(changedLength));
    };

    switch (added) {
      case "ADD":
        onAdd();
        break;
      case "EQUAL":
        onEqual(changed);
        break;
      case "DELETE":
        onDelete();
        break;
    }

    const afterUpdate = encodeStateAsUpdateV2(yDocRef.current);
    const diff = diffUpdateV2(afterUpdate, beforeUpdate);
    socket.emit("yjs", diff);
  };

  useEffect(() => {
    socket.on("yjs", (data: Uint8Array) => {
      const update = new Uint8Array(data);
      applyUpdateV2(yDocRef.current, update);
      setInputData(yDocRef.current.getText("myText").toString());
    });
  });
  return (
    <div>
      <input onChange={handleOnChange} value={inputData}></input>
      <p>{cursorPoint}</p>
    </div>
  );
};

export default CRDTInput;
