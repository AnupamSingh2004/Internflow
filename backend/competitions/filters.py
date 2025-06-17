#competitions/filters.py
import django_filters
from django.db.models import Q
from django.utils import timezone
from .models import Competition


class CompetitionFilter(django_filters.FilterSet):
    # Type filtering
    type = django_filters.ChoiceFilter(choices=Competition.COMPETITION_TYPES)
    
    # Tag filtering (supports multiple tags)
    tags = django_filters.CharFilter(method='filter_tags')
    
    # Eligibility filtering
    eligibility = django_filters.ChoiceFilter(choices=Competition.ELIGIBILITY_CHOICES)
    
    # Date filtering
    start_date_from = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateTimeFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateTimeFilter(field_name='end_date', lookup_expr='lte')
    registration_deadline_from = django_filters.DateTimeFilter(field_name='registration_deadline', lookup_expr='gte')
    registration_deadline_to = django_filters.DateTimeFilter(field_name='registration_deadline', lookup_expr='lte')
    
    # Status filtering
    status = django_filters.CharFilter(method='filter_status')
    
    # Prize filtering
    has_prizes = django_filters.BooleanFilter(method='filter_has_prizes')
    
    # Team size filtering
    max_team_size = django_filters.NumberFilter()
    max_team_size_gte = django_filters.NumberFilter(field_name='max_team_size', lookup_expr='gte')
    max_team_size_lte = django_filters.NumberFilter(field_name='max_team_size', lookup_expr='lte')
    
    # Certificate filtering
    certificate_available = django_filters.BooleanFilter()
    
    # Featured filtering
    is_featured = django_filters.BooleanFilter()
    
    # Organizer filtering
    created_by = django_filters.NumberFilter()
    created_by_name = django_filters.CharFilter(method='filter_created_by_name')
    
    # Date range presets
    date_range = django_filters.CharFilter(method='filter_date_range')

    class Meta:
        model = Competition
        fields = [
            'type', 'tags', 'eligibility', 'certificate_available', 'is_featured',
            'max_team_size', 'created_by'
        ]

    def filter_tags(self, queryset, name, value):
        """Filter by tags (comma-separated)"""
        if not value:
            return queryset
        
        tags = [tag.strip() for tag in value.split(',')]
        query = Q()
        for tag in tags:
            query |= Q(tags__icontains=tag)
        return queryset.filter(query)

    def filter_status(self, queryset, name, value):
        """Filter by competition status"""
        now = timezone.now()
        
        if value == 'upcoming':
            return queryset.filter(start_date__gt=now)
        elif value == 'ongoing':
            return queryset.filter(start_date__lte=now, end_date__gte=now)
        elif value == 'completed':
            return queryset.filter(end_date__lt=now)
        elif value == 'registration_open':
            return queryset.filter(registration_deadline__gte=now, is_active=True)
        elif value == 'registration_closed':
            return queryset.filter(registration_deadline__lt=now)
        
        return queryset

    def filter_has_prizes(self, queryset, name, value):
        """Filter competitions that have prizes"""
        if value:
            return queryset.filter(
                Q(first_prize__isnull=False) & ~Q(first_prize='') |
                Q(second_prize__isnull=False) & ~Q(second_prize='') |
                Q(third_prize__isnull=False) & ~Q(third_prize='')
            )
        else:
            return queryset.filter(
                Q(first_prize__isnull=True) | Q(first_prize=''),
                Q(second_prize__isnull=True) | Q(second_prize=''),
                Q(third_prize__isnull=True) | Q(third_prize='')
            )

    def filter_created_by_name(self, queryset, name, value):
        """Filter by organizer name"""
        return queryset.filter(
            Q(created_by__first_name__icontains=value) |
            Q(created_by__last_name__icontains=value) |
            Q(created_by__username__icontains=value)
        )

    def filter_date_range(self, queryset, name, value):
        """Filter by predefined date ranges"""
        now = timezone.now()
        
        if value == 'this_week':
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timezone.timedelta(days=7)
            return queryset.filter(start_date__range=[start, end])
        
        elif value == 'this_month':
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if start.month == 12:
                end = start.replace(year=start.year + 1, month=1)
            else:
                end = start.replace(month=start.month + 1)
            return queryset.filter(start_date__range=[start, end])
        
        elif value == 'next_month':
            if now.month == 12:
                start = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                end = start.replace(month=2) if start.month == 1 else start.replace(month=start.month + 1)
            else:
                start = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
                end = start.replace(month=start.month + 1) if start.month < 12 else start.replace(year=start.year + 1, month=1)
            return queryset.filter(start_date__range=[start, end])
        
        return queryset


class CompetitionSubmissionFilter(django_filters.FilterSet):
    """Filter for competition submissions"""
    status = django_filters.ChoiceFilter(choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('evaluated', 'Evaluated'),
        ('winner', 'Winner'),
        ('rejected', 'Rejected'),
    ])
    
    submitted_date_from = django_filters.DateTimeFilter(field_name='submitted_at', lookup_expr='gte')
    submitted_date_to = django_filters.DateTimeFilter(field_name='submitted_at', lookup_expr='lte')
    
    has_score = django_filters.BooleanFilter(method='filter_has_score')
    min_score = django_filters.NumberFilter(field_name='score', lookup_expr='gte')
    max_score = django_filters.NumberFilter(field_name='score', lookup_expr='lte')
    
    has_rank = django_filters.BooleanFilter(method='filter_has_rank')
    
    class Meta:
        model = Competition
        fields = ['status']
    
    def filter_has_score(self, queryset, name, value):
        if value:
            return queryset.filter(score__isnull=False)
        else:
            return queryset.filter(score__isnull=True)
    
    def filter_has_rank(self, queryset, name, value):
        if value:
            return queryset.filter(rank__isnull=False)
        else:
            return queryset.filter(rank__isnull=True)