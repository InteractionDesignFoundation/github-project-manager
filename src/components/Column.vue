<template>
    <div>
        {{ column.name }}
        <button v-if="isTodo()" @click="fillOutByIssues" title="Issues marked by special labels">Fill out by Issues</button>
        <button v-if="isTodo() || isDone()" @click="cleanupCards">Cleanup column</button>
    </div>
</template>

<script>
  import { GraphQLClient } from 'graphql-request';
  import { repo } from '../repoConfig';
  import { get as getSetting } from '../settingsStore';

  const labelsToFillOutBacklog = [
    'next sprint',
    'urgency:high ⚡️',
  ];

  const client = new GraphQLClient('https://api.github.com/graphql', { headers: {
      authorization: `Bearer ${getSetting('githubAccessToken')}`,
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
      fillOutByIssues: function () {
        const labelsIssuesHaveToAddToBacklog = labelsToFillOutBacklog
          .map(label => `"${label}"`)
          .join(', ');
        const query = `
{
  repository(owner: "${repo.owner}", name: "${repo.name}") {
    issues (first: 100, filterBy: {
      labels: [${labelsIssuesHaveToAddToBacklog}]
      states: OPEN
    }) {
      totalCount
      nodes {
        id
        title
        number
        assignees (first: 5)  {
          nodes {
            login
          }
        }
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
            const devLogins = getSetting('devLogins').split(',').map(loginWithWhitespace => loginWithWhitespace.trim());

            return issues.filter(issue => {
              const assigneesLogins = issue.assignees.nodes.map(assignee => assignee.login);
              return assigneesLogins.some(assigneeLogin => devLogins.includes(assigneeLogin));
            });
          })
          .then(devIssuesNotInThisColumn => {
            /** @see https://developer.github.com/v4/mutation/addprojectcard/ */
            const query = `
mutation AddProjectCardInput ($columnId: ID!, ${devIssuesNotInThisColumn.map((issue, index) => `$issueNumber${index}: ID!`).join(', ')}) {
  ${devIssuesNotInThisColumn.map((issue, index) => `createCard${index}: addProjectCard (input: {projectColumnId: $columnId, contentId: $issueNumber${index}}) {
    cardEdge {
      node {
        id
        content
      }
    }
  }`).join('\n')}
}
`;
            const variables = {};
            devIssuesNotInThisColumn.forEach((issue, index) => {
              variables[`issueNumber${index}`] = issue.id;
            });
            variables.columnId = this.column.id;

            return client.request(query, variables)
          })
          .then(cards => {
            this.$notify({
              group: 'app',
              title: `Success!`,
              text: `Found and added ${cards.length} issues to the ${this.column.name}`
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