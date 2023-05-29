// @ts-nocheck
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "../config/config.js";

import { validateKey } from "./apiKey.js";

const fastify = Fastify({ logger: true });
await fastify.register(cors, {
  origin: "*"
});

import { Configuration, OpenAIApi }  from "openai";

const configuration = new Configuration({
  organization: config.openai.orga,
  apiKey: config.openai.apiKey
});

fastify.route({
  method: "POST",
  url: "/chatapi",
  schema: {
    querystring: {
      role: {type: "string"},
      content: {type: "string"},
      apiKey: {type: "string"}
    },
    response: {
      200: {
        type: "object",
        properties: {
          role: {type: "string"},
          content: {type: "string"}
        }
      }
    }
  },
  handler: async function(request, reply) {
    if(!await validateKey(request.body.apiKey)){
      reply.send({"message": "Invalid api key."});
      return;
    }
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: config.openai.model,
      messages: JSON.parse(request.body.messages)
    });
    reply.send(completion.data.choices[0].message);
  }
});

fastify.route({
  method: "POST",
  url: "/apiKey",
  schema: {
    querystring: {
      key: {type: "string"}
    },
    response: {
      200: {
        type: "object",
        properties: {
          message: {type: "string"}
        }
      }
    }
  },
  handler: async function(request, reply) {
    if(await validateKey(request.body.key)){
      reply.send({"message": "Valid api key."});
    }
    else{
      reply.send({"message": "Invalid api key."});
    }
  }
});

const start = async() => {
  try {
    await fastify.listen({ port: config.server.port });
  } catch(err){
    console.err(err);
    process.exit(1);
  }
}

start();
