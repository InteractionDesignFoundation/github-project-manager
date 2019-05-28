<template>
    <section>
        <h2 class="title">Project statistics</h2>
        <PulseLoader v-if="isColumnActionsBlocked" class="has-text-centered"/>
        <div v-if="!isColumnActionsBlocked">
            <Column
                    :octo-graph-client="octoGraphClient"
                    v-for="column in columns"
                    :key="column.id"
                    :column="column"
            />
        </div>
    </section>
</template>

<script>
    import Column from './Column.vue';
    import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

    export default {
      name: 'ProjectStatistics',
      components: {
        Column,
        PulseLoader
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
          isColumnActionsBlocked: true,
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
            })
            .then(() => this.isColumnActionsBlocked = false)
        },
      }
    }
</script>
