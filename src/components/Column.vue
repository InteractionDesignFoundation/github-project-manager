<template>
    <div>
        {{ column.name }}
        <button v-if="isTodo()" @click="filloutByIssues">Fill out by Issues</button>
        <button v-if="isDone()" @click="cleanupCards">Cleanup</button>
    </div>
</template>

<script>
  import { GraphQLClient } from 'graphql-request';

  const client = new GraphQLClient('https://api.github.com/graphql', { headers: {
      authorization: `Bearer ${localStorage.getItem('githubAccessToken')}`,
    } });

  export default {
    name: 'column',
    props: {
      octoGraphClient: {
        type: Object,
        required: true,
      },
      column: {
        type: Object,
        required: true
      }
    },
    methods: {
      isTodo: function () {
        return this.column.purpose === 'TODO';
      },
      isInProgress: function () {
        return this.column.purpose === 'IN_PROGRESS';
      },
      isDone: function () {
        return this.column.purpose === 'DONE';
      },
      filloutByIssues: function () {
        const labelsIssuesHaveToAddToBacklog = `"next sprint", "urgency:high ⚡️"`;
        const query = `
{
  repository(owner: "InteractionDesignFoundation", name: "IDF-web") {
    issues (first: 100, filterBy: {
      labels: [${labelsIssuesHaveToAddToBacklog}]
      states: OPEN
    }) {
      totalCount
      nodes {
        title
        labels (first: 10) {
          nodes {
            name
          }
        }
      }
    }
  }
}
`;
        return this.octoGraphClient
          .json({query: query})
          .post()
          .json(json => json.data.repository.issues.nodes)
          .then(issues => {
            this.$notify({
              group: 'app',
              title: `Success!`,
              text: `Found ${issues.length} issues`
            });
          });
      },
      cleanupCards: function () {
        const cardIds = this.column.cards.nodes.map(card => card.id);

        /** @see https://developer.github.com/v4/mutation/deleteprojectcard/ */
        const query = `
mutation CleanupDoneColumn (${cardIds.map((cardId, index) => `$card${index}: ID!`).join(', ')}) {
  ${cardIds.map((cardId, index) => `cardRemoval${index}: deleteProjectCard (input: {cardId: $card${index}}) {
    column {
      id
    }
  }`).join('\n') }
}
`;

        const variables = {};
        cardIds.forEach((cardId, index) => {
          variables[`card${index}`] = cardId;
        });

        return client.request(query, variables)
          .then(removals => {
            this.$notify({
              group: 'app',
              title: `Success!`,
              text: `Removed ${Object.keys(removals).length} card(s) from ${this.column.name}`
            });
          });
      }
    }
  }
</script>