import { TranscriptLine } from '../types';

type SupportedLanguage = 'en' | 'es' | 'fr';

type LanguageTemplates = {
  [key in SupportedLanguage]: {
    intro: string;
    askUnique: string;
    features: string;
    askSupport: string;
    support: string;
  }
};

type SummaryTemplates = {
  [key in SupportedLanguage]: {
    intro: string;
    points: string[];
  }
};

type ResponseTemplates = {
  [key in SupportedLanguage]: {
    price: string;
    support: string;
    features: string;
    notDiscussed: string;
    noContext: string;
  }
};

const templates: LanguageTemplates = {
  en: {
    intro: "Hi there! I'd love to tell you about our {topic} solution.",
    askUnique: "Thanks for reaching out. What makes your solution unique?",
    features: "Our solution offers advanced features and competitive pricing.",
    askSupport: "Interesting. What about implementation time and support?",
    support: "We provide full implementation support and 24/7 customer service."
  },
  es: {
    intro: "¡Hola! Me encantaría contarte sobre nuestra solución de {topic}.",
    askUnique: "Gracias por contactarnos. ¿Qué hace única a su solución?",
    features: "Nuestra solución ofrece características avanzadas y precios competitivos.",
    askSupport: "Interesante. ¿Qué hay del tiempo de implementación y soporte?",
    support: "Proporcionamos soporte completo de implementación y servicio al cliente 24/7."
  },
  fr: {
    intro: "Bonjour! J'aimerais vous parler de notre solution {topic}.",
    askUnique: "Merci de nous contacter. Qu'est-ce qui rend votre solution unique?",
    features: "Notre solution offre des fonctionnalités avancées et des prix compétitifs.",
    askSupport: "Intéressant. Qu'en est-il du temps de mise en œuvre et du support?",
    support: "Nous fournissons un support complet pour l'implémentation et un service client 24/7."
  }
};

export class MockService {
  private language: SupportedLanguage = 'en';

  setLanguage(lang: string) {
    if (!this.isValidLanguage(lang)) {
      throw new Error(`Language ${lang} not supported. Available languages: ${Object.keys(templates).join(', ')}`);
    }
    this.language = lang;
  }

  private isValidLanguage(lang: string): lang is SupportedLanguage {
    return Object.keys(templates).includes(lang);
  }

  async generateTranscript(topic: string, duration: number = 5): Promise<TranscriptLine[]> {
    const linesPerMinute = 5;
    const numLines = Math.max(2, Math.round(duration * linesPerMinute));
    
    const t = templates[this.language];
    const baseTemplates = [
      { speaker: { name: "Sarah", company: "techsales.io" }, text: t.intro.replace('{topic}', topic) },
      { speaker: { name: "John", company: "client.com" }, text: t.askUnique },
      { speaker: { name: "Sarah", company: "techsales.io" }, text: t.features },
      { speaker: { name: "John", company: "client.com" }, text: t.askSupport },
      { speaker: { name: "Sarah", company: "techsales.io" }, text: t.support }
    ];

    const selectedTemplates = baseTemplates.slice(0, numLines);
    const timeStep = (duration * 60) / (numLines - 1);
    
    return selectedTemplates.map((template, index) => ({
      timestamp: this.formatTimestamp(index * timeStep),
      speaker: template.speaker,
      text: template.text
    }));
  }

  async summarizeTranscript(transcript: TranscriptLine[]): Promise<string> {
    const summaryTemplates: SummaryTemplates = {
      en: {
        intro: "Key points from the call:",
        points: [
          "Introduction of the product/service",
          "Discussion of unique features",
          "Pricing and implementation details covered",
          "Customer support options discussed"
        ]
      },
      es: {
        intro: "Puntos clave de la llamada:",
        points: [
          "Introducción del producto/servicio",
          "Discusión de características únicas",
          "Detalles de precios e implementación cubiertos",
          "Opciones de soporte al cliente discutidas"
        ]
      },
      fr: {
        intro: "Points clés de l'appel:",
        points: [
          "Présentation du produit/service",
          "Discussion des caractéristiques uniques",
          "Détails sur les prix et la mise en œuvre",
          "Options de support client discutées"
        ]
      }
    };

    const summary = summaryTemplates[this.language];
    return `${summary.intro}
${transcript.length > 1 ? `1. ${summary.points[0]}
2. ${summary.points[1]}` : `1. ${summary.points[0]}`}${transcript.length > 2 ? `
3. ${summary.points[2]}` : ''}${transcript.length > 3 ? `
4. ${summary.points[3]}` : ''}`;
  }

  async answerQuestion(transcript: TranscriptLine[], question: string): Promise<string> {
    const responses: ResponseTemplates = {
      en: {
        price: "The sales representative mentioned competitive pricing options.",
        support: "The company offers 24/7 customer service and full implementation support.",
        features: "The solution was described as having advanced features that differentiate it from competitors.",
        notDiscussed: "This topic was not discussed in this part of the conversation.",
        noContext: "I don't have enough context to answer that specific question based on the transcript."
      },
      es: {
        price: "El representante de ventas mencionó opciones de precios competitivos.",
        support: "La empresa ofrece servicio al cliente 24/7 y soporte completo de implementación.",
        features: "La solución fue descrita como poseedora de características avanzadas que la diferencian de la competencia.",
        notDiscussed: "Este tema no se discutió en esta parte de la conversación.",
        noContext: "No tengo suficiente contexto para responder esa pregunta específica basada en la transcripción."
      },
      fr: {
        price: "Le représentant commercial a mentionné des options de prix compétitifs.",
        support: "L'entreprise offre un service client 24/7 et un support complet pour l'implémentation.",
        features: "La solution a été décrite comme ayant des fonctionnalités avancées qui la différencient des concurrents.",
        notDiscussed: "Ce sujet n'a pas été abordé dans cette partie de la conversation.",
        noContext: "Je n'ai pas assez de contexte pour répondre à cette question spécifique basée sur la transcription."
      }
    };

    const r = responses[this.language];
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('price') || questionLower.includes('cost')) {
      return transcript.length > 2 ? r.price : r.notDiscussed;
    }
    if (questionLower.includes('support') || questionLower.includes('service')) {
      return transcript.length > 3 ? r.support : r.notDiscussed;
    }
    if (questionLower.includes('feature') || questionLower.includes('unique')) {
      return transcript.length > 2 ? r.features : r.notDiscussed;
    }
    
    return r.noContext;
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
