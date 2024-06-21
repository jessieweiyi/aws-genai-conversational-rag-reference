/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
export const DEFAULT_PROMPT_TEMPLATES = {
  condense: `

Human: Given the following conversational dialog delimited by ''', and the "Followup Question" below, rephrase the "Followup Question" to be a concise standalone question in its original language. Without answering the question, return only the standalone question.

Dialog: '''
{{#each chat_history}}
{{#if (eq type "human")}}Human: {{content}}
{{~else if (eq type "ai")}}Assistant: {{content}}
{{~else if (eq type "system")}}System: {{content}}
{{~else}}{{#if type}}{{type}}: {{/if}}{{content}}
{{/if}}{{#isnt @last true}}
{{/isnt}}{{/each}}
'''

Followup Question: {{question}}


Assistant: `,

  questionAnswer: `

Human: Read the follow text inside <context></context> tags, and then answer the question based on the provided rules:

<context>
{{context}}
</context>

Based on the context provided above, answer the following question based on these rules:    
- only use knowledge from the provided context to answer the question
- always be truthful, honest, unbiased, and unharmful
- be concise, do not repeat the question or yourself in the answer
- Do NOT start your answer with phrases such as "Based on the context" or "According
to the context", and just directly answer the question
- Always reply in plain text format only, never include html tags in your answer

After answering the question, double check that your answer follows the above rules before replying.

Question: {{question}}
  
Assistant: `,

  router: `

Human: Workspaces are able to answer user questions. The following text in <workspaces></workspaces> XML tags describes the purpose of each workspace to help you to determine what sorts of questions it can answer.

<workspaces>
{{#each workspaces}}
workspaceId: {{id}}, description: {{description}}
{{/each}}
</workspaces>

Choose the workspace above which is most applicable to answer the question. Answer in JSON format, with the key "workspaceId" selecting the chosen workspace, and the key "reasoning" providing the reasons for your choice. Answer only in JSON, with no additional text or context.

Question: {{question}}


Assistant: `,
};
