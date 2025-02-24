import React, { useEffect } from "react";
import Header from "../components/Header"
import Homework from "../components/Homework";
import { API_BASE_URL } from "../config";

export default function HomeworkPage() {
    // useEffect(() => {
    //     const fetchHomeworkData = async() => {
    //         try {
    //             const response = await fetch(`${API_BASE_URL}/`)
    //         }
    //     }
    // }, [])

    return (
        <body>
            <Header />

            <main class="homework-container">
                <div class="card">
                    <div class="mascot-helper">
                        <div>
                            <h1 class="title">
                                <i class="material-icons">code</i>
                                title of homework
                                Fun with Strings: Reverse the Vowels
                            </h1>
                        </div>
                    </div>

                    <div class="description">
                        <p>Hey there, coding champion! 🌟 Your mission today is to create a program that can reverse all the vowels in a word. It's like playing word scramble, but only with the vowels!</p>
                        <p>For example, if you have the word "hello", you'll swap the 'e' and 'o' to get "holle".</p>
                    </div>

                    {/* <div class="hint-card">
                        <strong>💡 Helpful Hint:</strong>
                        <p>Remember, the vowels are 'a', 'e', 'i', 'o', and 'u'. They can be uppercase or lowercase!</p>
                    </div> */}

                    <div class="code-editor">
                        <textarea class="code-area" placeholder="Write your code here...">def reverseVowels(word):
            # Your code goes here
            return word</textarea>
                    </div>

                    <div class="test-cases">
                        <h3>Test Your Code:</h3>
                        <div class="test-case">
                            <p>Input: "hello"</p>
                            <p>Expected Output: "holle"</p>
                        </div>
                        <div class="test-case">
                            <p>Input: "CODING"</p>
                            <p>Expected Output: "CODENG"</p>
                        </div>
                    </div>

                    <div class="button-group">
                        <button class="button button-primary">
                            <i class="material-icons">play_arrow</i>
                            Run Code
                        </button>
                        <button class="button button-secondary">
                            <i class="material-icons">check_circle</i>
                            Submit Solution
                        </button>
                    </div>
                </div>
                {/* <Homework /> */}
            </main>
        </body>
    )
}