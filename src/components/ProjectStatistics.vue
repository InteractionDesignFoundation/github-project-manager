<template>
    <section>
        <h2 class="title">Project statistics</h2>
        <Column
                v-for="column in columns"
                :key="column.id"
                :column="column"
        />
    </section>
</template>

<script>
    import Column from './Column.vue';

    export default {
      name: 'ProjectStatistics',
      components: {
        Column: Column
      },
      props: {
        octoGraphClient: {
          type: Object,
          required: true,
        },
        selectedProjectId: {
          type: Number,
          required: true,
        },
      },
      data() {
        return {
          project: undefined,
          columns: [],
        };
      },
      created: function () {
        this.loadProjectData();
      },
      methods: {
        loadProjectData: function () {
          const query = `
query {
  organization(login: "InteractionDesignFoundation") {
    project (number: ${this.selectedProjectId}) {
      name
      body
      updatedAt
      columns (first: 5) {
        nodes {
          id
          name
          purpose
          cards (first: 100) {
            totalCount
            nodes {
              content {
                __typename
                ... on Issue {
                  title
                  number
                  labels (first: 50) {
                    nodes {
                      name
                    }
                  }
                }
                ... on PullRequest {
                  title
                }
              }
              state
            }
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
            .json(json => json.data.organization.project)
            .then(project => {
              this.project = project;
              this.columns = project.columns.nodes;
            });
        },
      }
    }
</script>
