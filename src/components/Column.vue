<template>
    <div>
        {{ column.name }}
        <button v-if="isTodo()" @click="filloutByIssues">Fill out by Issues</button>
        <button v-if="isDone()" @click="cleanupCards">Cleanup</button>
    </div>
</template>

<script>
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
            console.log(issues);
          });
      },
      cleanupCards: function () {
        console.log(this.column);
      }
    }
  }
</script>