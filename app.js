//appTitle: Puter Functionalities Explorer

import React, { useState, useEffect } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';

twindSetup();

const App = () => {
    const [username, setUsername] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [keyValues, setKeyValues] = useState([]);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const signInAndFetchKeys = async () => {
            if (!puter.auth.isSignedIn()) {
                await puter.auth.signIn();
            }
            const user = await puter.auth.getUser();
            setUsername(user.username);

            const fetchedKeys = await puter.kv.list(true);
            fetchedKeys.forEach((field)=>{
              if (field.key === "openai_api_key"){
                field.value="sk-***********";
              }
            })
            setKeyValues(fetchedKeys);
        };
        signInAndFetchKeys();
    }, []);

    const sendMessage = () => {
        const messageList = [
            { role: "system", content: "A system message that guides the AI to respond appropriately" },
            { role: "user", content: currentMessage }
        ];
        setChatHistory(messageList);
        puter.ai.chat(messageList).then((response) => {
            const chatResponse = response.toString();
            setChatHistory(history => [...history, { role: "assistant", content: chatResponse }]);
            setCurrentMessage('');
            puter.ai.txt2speech(chatResponse).then(audio => audio.play());
        });
    };

    const addOrUpdateKeyValue = async () => {
        await puter.kv.set(newKey, newValue);
        const keyList = await puter.kv.list(true);
        keyList.forEach((field) => {
            if (field.key === "openai_api_key"){
                field.value = "sk-**********";
            }
        })
        setKeyValues(keyList);
        setNewKey('');
        setNewValue('');
    };

    const deleteKeyValue = async (keyToDelete) => {
        await puter.kv.del(keyToDelete);
        setKeyValues(await puter.kv.list(true));
    };

    const handleOpenFileDialog = async () => {
        try {
            const file = await puter.ui.showOpenFilePicker();
            const fileName = file.name;
            const fileContent = await (await file.read()).text();
            setFileName(fileName);
            setFileContent(fileContent);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    const handleSaveFileDialog = async () => {
        try {
            const file = await puter.ui.showSaveFilePicker(fileContent, 'example.txt');
            const fileName = file.name;
            setFileName(fileName);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    return (
        <div className="h-full w-screen bg-gray-800 text-white p-4">
            <header className="text-center text-2xl font-bold">Puter Functionalities Explorer with Puter File Dialog Demo</header>
            <div className="mt-4 flex flex-col items-center h-full">
                <div>Welcome, {username}</div>

                {/* Chat Section */}
                <div className="mt-4 w-3/4 flex flex-col">
                    <div>Chat with audio response:</div>
                    <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                        {chatHistory.map((entry, index) => (
                            <div key={index} className={`p-2 my-1 rounded ${entry.role === "assistant" ? "bg-blue-500" : "bg-green-500"}`}>{entry.content}</div>
                        ))}
                    </div>
                    <input className="text-black p-1 rounded-b-lg" placeholder="Type a message..." value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} />
                    <button className="my-2 self-end px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={sendMessage}>Send</button>
                </div>

                {/* Puter File Dialog Section */}
                <div className="mt-4 w-3/4">
                    <div>Puter File Dialog Demo:</div>
                    <button className="my-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={handleOpenFileDialog}>Open File</button>
                    <button className="my-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-700" onClick={handleSaveFileDialog}>Save File</button>
                    <div className="bg-gray-700 p-2 rounded-lg overflow-auto h-24 my-2">
                        {fileName && <div className="my-2">File Name: {fileName}</div>}
                        {fileContent && <div className="my-2">File Content: {fileContent}</div>}
                    </div>
                </div>

                {/* Key-Value Pairs Section */}
                <div className="mt-4 w-3/4">
                    <div>Key-Value Pairs:</div>
                    <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                        {keyValues.map(({ key, value }) => (
                            <div key={key} className="flex justify-between items-center my-2">
                                <div>{JSON.stringify({[key]: value})}</div>
                                <button className="ml-2 px-2 py-1 bg-red-500 rounded hover:bg-red-700" onClick={() => deleteKeyValue(key)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <input className="text-black p-1 w-1/3 border rounded-bl-lg" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} />
                    <input className="text-black p-1 border w-1/3" placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} />
                    <button className="py-1.5 bg-green-500 w-1/3 rounded-br-lg hover:bg-green-700" onClick={addOrUpdateKeyValue}>Add/Update</button>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
